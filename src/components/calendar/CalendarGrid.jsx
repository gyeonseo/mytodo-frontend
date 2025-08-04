import "./CalendarGrid.css";

const fmt = (y, m, d) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function CalendarGrid({
  year,
  month, // 1~12
  statusMap, // { "2025-08-01": "DONE", ... }
  onDayClick, // (dateStr, currentStatus) => void
}) {
  const first = new Date(year, month - 1, 1);
  const start = first.getDay(); // 0~6
  const daysInMonth = new Date(year, month, 0).getDate();

  const leading = start;
  const totalCells = 42;
  const trailing = totalCells - (leading + daysInMonth);

  const statusColor = {
    DONE: "#22c55e",
    FAIL: "#ef4444",
    NONE: "#e5e7eb",
  };

  const weekday = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div>
      <div className="calendar-weekdays">
        {weekday.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {Array.from({ length: leading }, (_, i) => (
          <div key={`ph-l-${i}`} className="calendar-cell--placeholder" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = fmt(year, month, day);
          const st = statusMap[dateStr] || "NONE";

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick?.(dateStr, st)}
              className="calendar-cell"
              title={`${dateStr} - ${st}`}
            >
              <div className="calendar-cell__day">{day}</div>
              <div
                className="calendar-cell__dot"
                style={{ background: statusColor[st] ?? "#e5e7eb" }}
              />
              <div className="calendar-cell__status">{st}</div>
            </button>
          );
        })}

        {Array.from({ length: trailing }, (_, i) => (
          <div key={`ph-r-${i}`} className="calendar-cell--placeholder" />
        ))}
      </div>
    </div>
  );
}
