import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchCategoryById } from "../apis/category";
import {
  fetchCalendarByCategoryId,
  updateCalendarStatus,
} from "../apis/calendar";
import CalendarGrid from "../components/calendar/CalendarGrid";
import "./CalendarPage.css";

function useSafeSearchParams() {
  const location = useLocation();
  let raw = location.search;
  if (!raw && location.hash) {
    const i = location.hash.indexOf("?");
    if (i !== -1) raw = location.hash.slice(i);
  }
  return useMemo(() => new URLSearchParams(raw), [raw]);
}

const FLUSH_DEBOUNCE_MS = 1500; // 변경 후 이 시간 동안 추가 입력 없으면 저장
const FLUSH_INTERVAL_MS = 15000; // 주기적으로 저장
const LS_KEY = (catId, y, m) => `pendingCalendar_${catId}_${y}-${m}`;

export default function CalendarPage() {
  const navigate = useNavigate();
  const searchParams = useSafeSearchParams();

  const categoryId = searchParams.get("category");
  const now = useMemo(() => new Date(), []);
  const year = Number(searchParams.get("year")) || now.getFullYear();
  const month = Number(searchParams.get("month")) || now.getMonth() + 1;

  const [category, setCategory] = useState(null);
  const [calendar, setCalendar] = useState([]); // [{date, status}]
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [debug, setDebug] = useState(false);

  // 저장 상태 표시
  const [saving, setSaving] = useState(false);
  const [dirtyCount, setDirtyCount] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // 변경 누적(Map: date -> status)
  const pendingRef = useRef(new Map());
  const debounceRef = useRef(null);
  const intervalRef = useRef(null);

  const statusMap = useMemo(() => {
    const m = {};
    for (const it of calendar || []) m[it.date] = it.status;
    return m;
  }, [calendar]);

  // 초기 로드 + 미전송 변경 복원
  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const [cat, cal] = await Promise.all([
          fetchCategoryById(categoryId),
          fetchCalendarByCategoryId(categoryId, year, month),
        ]);
        if (!cancelled) {
          setCategory({ ...cat, id: cat.id ?? cat.fid ?? cat.categoryId });
          setCalendar(cal);
        }

        // 로컬 보관된 미전송 변경 복원
        const saved = localStorage.getItem(LS_KEY(categoryId, year, month));
        if (saved) {
          const obj = JSON.parse(saved);
          Object.entries(obj).forEach(([date, status]) => {
            pendingRef.current.set(date, status);
          });
          setDirtyCount(pendingRef.current.size);
          // 화면에도 반영
          setCalendar((prev) => {
            const copy = [...prev];
            const idxByDate = new Map(copy.map((d, i) => [d.date, i]));
            for (const [date, status] of Object.entries(obj)) {
              const idx = idxByDate.get(date);
              if (idx != null) copy[idx] = { ...copy[idx], status };
              else copy.push({ date, status });
            }
            return copy;
          });
        }
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        if (!cancelled) setErr(e?.message || "요청 중 오류가 발생했어요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [categoryId, year, month, navigate]);

  // 변경 → 로컬만 반영 + 큐에 적재
  const handleDayClick = (dateStr, current) => {
    const order = ["NONE", "DONE", "FAIL"];
    const next = order[(order.indexOf(current) + 1) % order.length];

    // 화면 반영 (낙관적)
    setCalendar((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((d) => d.date === dateStr);
      if (idx >= 0) copy[idx] = { ...copy[idx], status: next };
      else copy.push({ date: dateStr, status: next });
      return copy;
    });

    // 큐 적재 (마지막 값 우선)
    pendingRef.current.set(dateStr, next);
    setDirtyCount(pendingRef.current.size);

    // 로컬 보관 (앱 종료 대비)
    const stashObj = Object.fromEntries(pendingRef.current.entries());
    localStorage.setItem(
      LS_KEY(categoryId, year, month),
      JSON.stringify(stashObj)
    );

    // 디바운스 저장 예약
    scheduleFlush();
  };

  const scheduleFlush = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(flushPending, FLUSH_DEBOUNCE_MS);
  };

  const flushPending = async () => {
    const entries = [...pendingRef.current.entries()];
    if (entries.length === 0 || saving) return;

    setSaving(true);
    // 비우고 시작 (실패 시 되돌려 담음)
    pendingRef.current.clear();
    setDirtyCount(0);
    localStorage.removeItem(LS_KEY(categoryId, year, month));

    try {
      // 단건 API만 있으므로 순차 호출
      for (const [date, status] of entries) {
        await updateCalendarStatus(categoryId, date, status);
      }
      setLastSavedAt(new Date());
    } catch (e) {
      // 실패 시 다시 큐에 되돌림
      for (const [date, status] of entries) {
        pendingRef.current.set(date, status);
      }
      setDirtyCount(pendingRef.current.size);
      const stashObj = Object.fromEntries(pendingRef.current.entries());
      localStorage.setItem(
        LS_KEY(categoryId, year, month),
        JSON.stringify(stashObj)
      );
      console.error("저장 실패, 재시도 대기:", e);
    } finally {
      setSaving(false);
    }
  };

  // 주기적 저장
  useEffect(() => {
    intervalRef.current = setInterval(flushPending, FLUSH_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  // 종료 직전: 큐가 비어 있으면 무시, 있으면 로컬에 남김
  useEffect(() => {
    const handler = () => {
      if (pendingRef.current.size > 0) {
        const stashObj = Object.fromEntries(pendingRef.current.entries());
        localStorage.setItem(
          LS_KEY(categoryId, year, month),
          JSON.stringify(stashObj)
        );
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [categoryId, year, month]);

  const goMonth = (delta) => {
    const base = new Date(year, month - 1 + delta, 1);
    const y = base.getFullYear();
    const m = base.getMonth() + 1;
    navigate(`/app?category=${categoryId}&year=${y}&month=${m}`);
  };

  if (!categoryId) {
    return (
      <div className="calendar-page">
        category 파라미터가 없습니다. (/app?category=ID)
      </div>
    );
  }
  if (loading) return <div className="calendar-page">불러오는 중…</div>;
  if (err)
    return (
      <div className="calendar-page" style={{ color: "crimson" }}>
        ERROR: {err}
      </div>
    );

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div className="calendar-title">
          Category: <b>{category?.name}</b> (id: {category?.id}, color:{" "}
          {category?.color})
        </div>
        <div className="calendar-controls">
          <button onClick={() => goMonth(-1)}>〈 </button>
          <div className="calendar-controls__month">
            {year}-{String(month).padStart(2, "0")}
          </div>
          <button onClick={() => goMonth(1)}> 〉</button>
          {/* 저장 상태 표시 */}
          {saving ? (
            <span className="save-indicator save-indicator--saving">
              저장 중…
            </span>
          ) : dirtyCount > 0 ? (
            <span className="save-indicator save-indicator--dirty">
              미전송 {dirtyCount}건
            </span>
          ) : lastSavedAt ? (
            <span className="save-indicator">
              저장됨 {lastSavedAt.toLocaleTimeString()}
            </span>
          ) : null}
          <label style={{ marginLeft: 12 }}>
            <input
              type="checkbox"
              checked={debug}
              onChange={(e) => setDebug(e.target.checked)}
            />{" "}
            debug
          </label>
          <button
            onClick={() =>
              navigate(`/app/category/edit?category=${categoryId}`)
            }
          >
            Edit
          </button>
        </div>
      </div>

      <div className="calendar-info">
        날짜를 클릭하면 NONE → DONE → FAIL → NONE 순으로 변경됩니다. 변경은 잠시
        후 자동 저장됩니다.
      </div>

      <div style={{ marginTop: 12 }}>
        <CalendarGrid
          year={year}
          month={month}
          statusMap={statusMap}
          onDayClick={handleDayClick}
        />
      </div>

      {debug && (
        <>
          <h3 style={{ marginTop: 16 }}>Raw JSON</h3>
          <pre
            style={{
              background: "#0b1220",
              color: "#c6f6d5",
              padding: 12,
              borderRadius: 8,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(calendar, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}
