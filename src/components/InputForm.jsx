import "./InputForm.css";
import { useNavigate } from "react-router-dom";
import { saveCategory } from "../apis/category";
import React, { useState, useEffect } from "react";

const InputForm = ({ mode = "create", category = {}, onSuccess, children }) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  // 수정 모드일 경우 기본값 세팅
  useEffect(() => {
    if (mode === "edit" && category) {
      setName(category.name || "");
      setColor(category.color || "");
      setNote(category.note || "");
    }
  }, [mode, category]);

  const handleSave = async () => {
    const userId = localStorage.getItem("userId");

    if (!name || !color) {
      alert("Name과 Color는 필수입니다.");
      return;
    }

    const payload = {
      name,
      color,
      note,
      userId,
    };

    if (mode === "edit") {
      payload.id = category.id; // PUT 시 id 필요
    }

    try {
      await saveCategory(payload, mode === "edit");
      setSaved(true);
      alert(mode === "edit" ? "수정 완료!" : "저장 완료!");
      if (typeof onSuccess === "function") onSuccess(); // 안전하게 실행
    } catch (err) {
      alert("저장 실패");
      console.error(err);
    }
  };

  return (
    <div className="input-form-wrapper">
      <div className="input-form">
        <InputField label="Name" value={name} onChange={setName} type="text" />
        <InputField
          label="Color"
          value={color}
          onChange={setColor}
          type="color"
        />
        <InputField label="Note" value={note} onChange={setNote} type="text" />

        <div className="button-row">
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
          {children}
        </div>

        {saved && (
          <p className="saved-message">
            {mode === "edit" ? "Updated" : "Saved"} successfully
          </p>
        )}
      </div>
    </div>
  );
};

// text, color만 지원
const InputField = ({ label, value, onChange, type = "text" }) => (
  <div className="input-field">
    <label className="input-label">{label}</label>
    <input
      type={type}
      className={
        type === "color" ? "form-control form-control-color" : "input-box"
      }
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default InputForm;
