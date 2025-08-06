import "./CalendarGrid.css";

const fmt = (y, m, d) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function CalendarGrid({
  year,
  month, // 1~12
  statusMap, // { "2025-08-01": "DONE", ... }
  onDayClick,
  categoryColor, // CalendarPage에서 전달
}) {
  const first = new Date(year, month - 1, 1);
  const start = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const leading = start;
  const totalCells = 42;
  const trailing = totalCells - (leading + daysInMonth);

  const weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const lightenColor = (colorStr, amount = 0.85) => {
    if (!colorStr) return "#ffffff";

    let hex = colorStr.startsWith("#") ? colorStr : `#${colorStr}`;

    // #abc → #aabbcc 변환
    if (hex.length === 4) {
      hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }

    const num = parseInt(hex.slice(1), 16);
    if (isNaN(num)) return "#ffffff";

    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    // 비율만큼 흰색 쪽으로 이동
    r = Math.round(r + (255 - r) * amount);
    g = Math.round(g + (255 - g) * amount);
    b = Math.round(b + (255 - b) * amount);

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div style={{ width: "450px", margin: "0 auto" }}>
      {/* 요일 헤더 */}
      <div className="calendar-grid calendar-grid--header">
        {weekday.map((w) => (
          <div key={w} className="calendar-weekday">
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="calendar-grid">
        {Array.from({ length: leading }, (_, i) => (
          <div key={`ph-l-${i}`} className="calendar-cell--placeholder" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = fmt(year, month, day);
          const status = statusMap[dateStr];
          const isDone = status === "DONE";

          // 항상 안전하게 hex 문자열 생성
          const rawColor = categoryColor ? String(categoryColor) : "#ff0000";
          const borderCol = rawColor.startsWith("#")
            ? rawColor
            : `#${rawColor}`;

          const bgCol = isDone ? lightenColor(borderCol, 0.85) : "#ffffff";

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick?.(dateStr, status)}
              className="calendar-cell"
              style={{
                border: `4px solid ${isDone ? borderCol : "#e5e7eb"}`,
                backgroundColor: bgCol,
              }}
            >
              <div className="calendar-cell__day">{day}</div>
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
