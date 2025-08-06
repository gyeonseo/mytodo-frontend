// CalendarPage.jsx
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

const FLUSH_DEBOUNCE_MS = 1500;
const FLUSH_INTERVAL_MS = 15000;
const LS_KEY = (catId, y, m) => `pendingCalendar_${catId}_${y}-${m}`;

export default function CalendarPage() {
  const navigate = useNavigate();
  const searchParams = useSafeSearchParams();

  const categoryId = searchParams.get("category");
  const now = useMemo(() => new Date(), []);
  const year = Number(searchParams.get("year")) || now.getFullYear();
  const month = Number(searchParams.get("month")) || now.getMonth() + 1;

  const [category, setCategory] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [debug, setDebug] = useState(false);

  const [saving, setSaving] = useState(false);
  const [dirtyCount, setDirtyCount] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const pendingRef = useRef(new Map());
  const debounceRef = useRef(null);
  const intervalRef = useRef(null);

  const statusMap = useMemo(() => {
    const m = {};
    for (const it of calendar || []) m[it.date] = it.status;
    return m;
  }, [calendar]);

  // 초기 로드
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

        // 로컬 복원
        const saved = localStorage.getItem(LS_KEY(categoryId, year, month));
        if (saved) {
          const obj = JSON.parse(saved);
          Object.entries(obj).forEach(([date, status]) => {
            pendingRef.current.set(date, status);
          });
          setDirtyCount(pendingRef.current.size);
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
        if (e?.response?.status === 401) {
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

  // 상태 변경: NONE ↔ DONE
  const handleDayClick = (dateStr, current) => {
    const next = current === "DONE" ? "NONE" : "DONE";

    setCalendar((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((d) => d.date === dateStr);
      if (idx >= 0) copy[idx] = { ...copy[idx], status: next };
      else copy.push({ date: dateStr, status: next });
      return copy;
    });

    pendingRef.current.set(dateStr, next);
    setDirtyCount(pendingRef.current.size);

    const stashObj = Object.fromEntries(pendingRef.current.entries());
    localStorage.setItem(
      LS_KEY(categoryId, year, month),
      JSON.stringify(stashObj)
    );

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
    pendingRef.current.clear();
    setDirtyCount(0);
    localStorage.removeItem(LS_KEY(categoryId, year, month));

    try {
      for (const [date, status] of entries) {
        await updateCalendarStatus(categoryId, date, status);
      }
      setLastSavedAt(new Date());
    } catch (e) {
      for (const [date, status] of entries) {
        pendingRef.current.set(date, status);
      }
      setDirtyCount(pendingRef.current.size);
      localStorage.setItem(
        LS_KEY(categoryId, year, month),
        JSON.stringify(Object.fromEntries(pendingRef.current.entries()))
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(flushPending, FLUSH_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (pendingRef.current.size > 0) {
        localStorage.setItem(
          LS_KEY(categoryId, year, month),
          JSON.stringify(Object.fromEntries(pendingRef.current.entries()))
        );
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [categoryId, year, month]);

  const goMonth = (delta) => {
    const base = new Date(year, month - 1 + delta, 1);
    navigate(
      `/app?category=${categoryId}&year=${base.getFullYear()}&month=${
        base.getMonth() + 1
      }`
    );
  };

  if (!categoryId) {
    return <div className="calendar-page">category 파라미터가 없습니다.</div>;
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
        <button className="nav-btn prev-btn" onClick={() => goMonth(-1)}>
          〈
        </button>
        <div className="calendar-title">
          <div className="calendar-month">
            {new Date(year, month - 1).toLocaleString("default", {
              month: "long",
            })}
          </div>
          <div className="calendar-year">{year}</div>
        </div>
        <button className="nav-btn next-btn" onClick={() => goMonth(1)}>
          〉
        </button>
      </div>

      <div className="calendar-status-bar">
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
        <label className="debug-toggle">
          <input
            type="checkbox"
            checked={debug}
            onChange={(e) => setDebug(e.target.checked)}
          />{" "}
          debug
        </label>
        <button
          className="edit-btn"
          onClick={() => navigate(`/app/category/edit?category=${categoryId}`)}
        >
          Edit
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <CalendarGrid
          year={year}
          month={month}
          statusMap={statusMap}
          onDayClick={handleDayClick}
          categoryColor={category?.color}
        />
      </div>

      {debug && (
        <div className="debug-section">
          <h3>Raw JSON</h3>
          <pre>{JSON.stringify(calendar, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
