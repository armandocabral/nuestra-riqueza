import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://idqmsztjzoxezreeccpg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkcW1zenRqem94ZXpyZWVjY3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDUwMTIsImV4cCI6MjA5MjU4MTAxMn0.PzTqqSkHmHN0KIcITe1VBjD2u2CrTNpslU_733g1fMg";
const ADMIN_PASSWORD = "NR2026";

const QUESTIONS = [
  {
    id: "q1", type: "radio",
    eyebrow: "Primero, cuéntanos sobre ti.",
    question: "¿Cuánto tiempo llevas viviendo en Estados Unidos?",
    options: ["Menos de 2 años", "2 a 5 años", "5 a 10 años", "Más de 10 años", "Nací aquí"],
  },
  {
    id: "q2", type: "radio",
    eyebrow: "Tu situación financiera hoy.",
    question: "¿Cómo describes tu relación con el dinero ahora mismo?",
    options: [
      "Llego bien al mes pero no sobra nada",
      "Ahorro un poco pero no sé qué hacer con eso",
      "Tengo algo invertido pero no lo entiendo bien",
      "Me siento perdido/a con mis finanzas",
      "Estoy bien y busco crecer más",
    ],
  },
  {
    id: "q3", type: "radio",
    eyebrow: "El sueño que todos llevamos dentro.",
    question: "¿Cuál es tu mayor motivación financiera?",
    options: [
      "Dejar de vivir de quincena en quincena",
      "Comprar una casa aquí o en mi país",
      "Darle educación universitaria a mis hijos",
      "Retirarme con dignidad y tranquilidad",
      "Crear un negocio o dejarle algo a mi familia",
    ],
  },
  {
    id: "q4", type: "radio",
    eyebrow: "El obstáculo honesto.",
    question: "¿Qué te ha frenado de mejorar tus finanzas hasta hoy?",
    options: [
      "No sé por dónde empezar",
      "Los asesores son muy caros o complicados",
      "No confío en las instituciones financieras",
      "No tengo tiempo para aprenderlo solo/a",
      "Nadie en mi familia o comunidad lo sabe tampoco",
    ],
  },
  {
    id: "q5", type: "radio",
    eyebrow: "Imaginemos algo juntos.",
    question: "Si tuvieras un asesor que habla tu idioma y entiende tu cultura, ¿qué harías primero?",
    options: [
      "Crear un plan para invertir mis ahorros",
      "Entender cómo funciona la bolsa de valores",
      "Planificar mi retiro",
      "Aprender a manejar deudas y crédito",
      "Proteger a mi familia con seguros y herencias",
    ],
  },
  {
    id: "q6", type: "radio",
    eyebrow: "La pregunta directa.",
    question: "¿Cuánto estarías dispuesto/a a invertir mensualmente en tu asesoría financiera?",
    options: [
      "Menos de $50 al mes",
      "$50 – $100 al mes",
      "$100 – $200 al mes",
      "Más de $200 si veo resultados reales",
      "Aún no estoy seguro/a",
    ],
  },
  {
    id: "q7", type: "text",
    eyebrow: "Tu voz importa más que cualquier dato.",
    question: "¿Qué necesitaría tener un servicio financiero para que tú confiaras en él?",
    placeholder: "Escribe lo que sientes, no lo que crees que deberías decir. Cada palabra nos ayuda.",
  },
  {
    id: "q8", type: "profile",
    eyebrow: "Casi listo.",
    question: "¿Dónde vives y cómo te avisamos cuando lancemos?",
  },
];

const TRANSITIONS = [
  null,
  "Gracias por eso. Sigamos.",
  "Eso nos dice mucho. Continúa.",
  "Ese sueño es completamente posible.",
  "Eso es más común de lo que crees.",
  "Perfecto. Ahora la pregunta que muchos evitan…",
  "Esa honestidad vale oro. Una más.",
  "Esta es la más importante de todas.",
];

const getResultMessage = (answers) => {
  const motivation = answers.q3 || "";
  const name = answers.name ? `, ${answers.name}` : "";
  const messages = {
    "Dejar de vivir de quincena en quincena": `Vivir de quincena en quincena no es un defecto tuyo${name} — es el resultado de un sistema que nunca nos enseñó a manejar el dinero. La buena noticia: eso se aprende, y se aprende más rápido de lo que crees cuando tienes a alguien que te guía en tu idioma.`,
    "Comprar una casa aquí o en mi país": `La casa propia${name} no es solo ladrillos — es seguridad, es raíces, es el legado que dejas. Miles de latinos lo han logrado sin ganar fortunas. El camino existe, y no está tan lejos como parece cuando alguien te lo muestra claro.`,
    "Darle educación universitaria a mis hijos": `Querer darle educación a tus hijos${name} es el acto de amor más grande que existe. Y la verdad es que con una estrategia clara hoy, ese sueño es completamente alcanzable — sin sacrificar tu propio bienestar.`,
    "Retirarme con dignidad y tranquilidad": `Retirarte con tranquilidad${name} no es un lujo — es tu derecho después de años de trabajo duro. Cada año que pasa sin un plan cuesta más de lo que imaginas. Pero cada año que empiezas antes, también se multiplica más de lo que imaginas.`,
    "Crear un negocio o dejarle algo a mi familia": `El deseo de dejar algo${name} — un negocio, una herencia, una historia — es lo que mueve a los que construyen riqueza generacional. Eso no se hereda, se aprende. Y estás exactamente en el lugar correcto para comenzar.`,
  };
  return messages[motivation] || `Lo que compartiste hoy${name} nos dice que estás listo/a para algo diferente. No para hacerte rico/a de la noche a la mañana — sino para construir algo real, con fundamentos sólidos, en tu idioma y con tu cultura.`;
};

const tally = (data, key) => {
  const counts = {};
  data.forEach(r => { const v = r[key] || "Sin respuesta"; counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
};
const pct = (n, total) => total ? Math.round((n / total) * 100) : 0;

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeOut  { from{opacity:1} to{opacity:0;transform:translateY(-10px)} }
  @keyframes floatIn  { from{opacity:0;transform:translateY(30px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes heartbeat{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
  @keyframes glow     { 0%,100%{box-shadow:0 0 0 0 #b5351522} 50%{box-shadow:0 0 24px 6px #b5351533} }
  @keyframes barGrow  { from{width:0} to{width:var(--w)} }
  .fade-in  { animation:fadeUp  .55s cubic-bezier(.22,1,.36,1) forwards; }
  .fade-out { animation:fadeOut .28s ease forwards; }
  .float-in { animation:floatIn .7s  cubic-bezier(.22,1,.36,1) forwards; }
  .opt-btn { width:100%;background:#fffdf9;border:1.5px solid #e2d9cc;border-radius:12px;
    padding:15px 18px;margin-bottom:10px;font-family:'DM Sans',sans-serif;font-size:15px;
    color:#2a1f10;cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;
    transition:.18s;line-height:1.45; }
  .opt-btn:hover{border-color:#b53515;background:#fff7f5;transform:translateX(5px);}
  .opt-btn.sel{border-color:#b53515;background:#fff2ef;color:#b53515;font-weight:500;}
  .dot{min-width:22px;height:22px;border-radius:50%;border:2px solid currentColor;
    display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;transition:.18s;}
  .sel .dot{background:#b53515;color:white;border-color:#b53515;}
  textarea.ta{width:100%;min-height:120px;background:#fffdf9;border:1.5px solid #e2d9cc;
    border-radius:12px;padding:16px;font-family:'DM Sans',sans-serif;font-size:15px;
    color:#2a1f10;resize:vertical;outline:none;line-height:1.65;transition:.18s;}
  textarea.ta:focus{border-color:#b53515;}
  input.fi{width:100%;background:#fffdf9;border:1.5px solid #e2d9cc;border-radius:12px;
    padding:14px 16px;margin-bottom:12px;font-family:'DM Sans',sans-serif;font-size:15px;
    color:#2a1f10;outline:none;transition:.18s;}
  input.fi:focus{border-color:#b53515;}
  input.fi::placeholder{color:#b0a090;}
  .btn-primary{background:#b53515;color:white;border:none;border-radius:12px;
    padding:15px 30px;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;
    cursor:pointer;letter-spacing:.02em;transition:.18s;}
  .btn-primary:hover{background:#943010;transform:translateY(-2px);box-shadow:0 8px 28px #b5351533;}
  .btn-primary:disabled{background:#c8b8a8;cursor:not-allowed;transform:none;box-shadow:none;}
  .btn-primary.full{width:100%;font-size:16px;padding:17px;}
  .pain-item{background:#fffdf9;border-radius:14px;padding:20px 22px;margin-bottom:12px;
    border-left:3px solid #b53515;display:flex;gap:14px;align-items:flex-start;
    animation:fadeUp .5s ease forwards;}
  .stat-pill{display:inline-flex;align-items:center;gap:8px;background:#fff7f5;
    border:1px solid #e8c8c0;border-radius:20px;padding:7px 14px;
    font-family:'DM Sans',sans-serif;font-size:13px;color:#7a3020;}
  .result-card{background:white;border-radius:18px;padding:32px 28px;
    margin-bottom:18px;box-shadow:0 2px 24px #2a1f1008;}
  .progress-fill{transition:width .4s cubic-bezier(.22,1,.36,1);}
  .admin-row:hover{background:#fff7f5 !important;}
  .bar-fill{height:100%;background:linear-gradient(90deg,#b53515,#d4843a);
    border-radius:4px;animation:barGrow .7s ease forwards;}
  .tag{display:inline-block;background:#fff2ef;border:1px solid #e8c0bc;
    border-radius:20px;padding:4px 12px;font-size:12px;color:#b53515;
    font-family:'DM Sans',sans-serif;margin:3px;}
`;

export default function App() {
  const [phase, setPhase]         = useState("landing");
  const [step, setStep]           = useState(0);
  const [answers, setAnswers]     = useState({});
  const [transitioning, setTrans] = useState(false);
  const [count, setCount]         = useState(0);
  const [responses, setResponses] = useState([]);
  const [visible, setVisible]     = useState(false);
  const [adminInput, setAdminInput]   = useState("");
  const [adminError, setAdminError]   = useState(false);
  const [adminView, setAdminView]     = useState("summary");
  const [selectedRow, setSelectedRow] = useState(null);
  const topRef = useRef(null);
  const scrollTop = () => topRef.current?.scrollIntoView({ behavior:"smooth" });

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/responses?select=*&order=created_at.desc`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setResponses(data);
        setCount(data.length);
      }
    } catch {}
  };

  const saveResponse = async (finalAnswers) => {
    try {
      const row = {
        name: finalAnswers.name || null,
        email: finalAnswers.email || null,
        city: finalAnswers.city || null,
        origin: finalAnswers.origin || null,
        q1: finalAnswers.q1 || null,
        q2: finalAnswers.q2 || null,
        q3: finalAnswers.q3 || null,
        q4: finalAnswers.q4 || null,
        q5: finalAnswers.q5 || null,
        q6: finalAnswers.q6 || null,
        q7: finalAnswers.q7 || null,
      };
      await fetch(`${SUPABASE_URL}/rest/v1/responses`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(row)
      });
      await loadData();
    } catch {}
  };

  const deleteResponse = async (id) => {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/responses?id=eq.${id}`, {
        method: "DELETE",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      await loadData();
      setSelectedRow(null);
    } catch {}
  };

  const next = async (val) => {
    const q = QUESTIONS[step];
    const updated = { ...answers, [q.id]: val };
    setAnswers(updated);
    if (step < QUESTIONS.length - 1) {
      setTrans(true);
      setTimeout(() => { setStep(step + 1); setTrans(false); scrollTop(); }, 320);
    } else {
      await saveResponse(updated);
      setPhase("result"); scrollTop();
    }
  };

  const tryAdmin = () => {
    if (adminInput.trim() === ADMIN_PASSWORD) {
      loadData(); setPhase("admin"); setAdminInput(""); setAdminError(false); scrollTop();
    } else {
      setAdminError(true); setTimeout(() => setAdminError(false), 1800);
    }
  };

  const q = QUESTIONS[step];
  const progress = Math.round((step / QUESTIONS.length) * 100);
  const displayCount = Math.max(count, 47);

  // ── ADMIN PANEL ──────────────────────────────────────────────
  if (phase === "admin") {
    const total = responses.length;
    const withEmail = responses.filter(r => r.email).length;
    const interested = responses.filter(r => r.q6 && !r.q6.includes("seguro")).length;

    return (
      <div style={{ minHeight:"100vh", background:"#f9f4ec", fontFamily:"'DM Sans',sans-serif" }}>
        <style>{BASE_CSS}</style>
        <div ref={topRef} />
        <nav style={{ background:"#1c0e06", borderBottom:"1px solid #3a1a0a", padding:"14px 24px", position:"sticky", top:0, zIndex:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700, color:"white" }}>
            Nuestra <span style={{ color:"#e8a060" }}>Riqueza</span>
            <span style={{ fontSize:11, color:"#8a6040", marginLeft:10, letterSpacing:".1em" }}>ADMIN</span>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[["summary","Resumen"],["contacts","Contactos"],["raw","Respuestas"]].map(([v,l]) => (
              <button key={v} onClick={() => { setAdminView(v); setSelectedRow(null); }} style={{
                background: adminView===v?"#b53515":"transparent", color: adminView===v?"white":"#c8a080",
                border:`1px solid ${adminView===v?"#b53515":"#5a3020"}`, borderRadius:8,
                padding:"6px 14px", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif"
              }}>{l}</button>
            ))}
            <button onClick={() => { setPhase("landing"); scrollTop(); }} style={{ background:"transparent", color:"#8a6040", border:"1px solid #5a3020", borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>← Salir</button>
          </div>
        </nav>

        <div style={{ maxWidth:860, margin:"0 auto", padding:"32px 20px 60px" }}>

          {/* SUMMARY */}
          {adminView === "summary" && (
            <div className="fade-in">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:28 }}>
                {[
                  { label:"Total respuestas", value:total, icon:"📊" },
                  { label:"Con email", value:withEmail, icon:"📧" },
                  { label:"Interesados", value:interested, icon:"💰" },
                  { label:"Conversión", value:`${pct(withEmail,total)}%`, icon:"📈" },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ background:"white", borderRadius:14, padding:"20px 16px", boxShadow:"0 2px 12px #2a1f1008", textAlign:"center" }}>
                    <div style={{ fontSize:26, marginBottom:8 }}>{icon}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, color:"#b53515", fontWeight:700 }}>{value}</div>
                    <div style={{ fontSize:11, color:"#8a7050", marginTop:4 }}>{label}</div>
                  </div>
                ))}
              </div>

              {total === 0 ? (
                <div style={{ background:"white", borderRadius:14, padding:"48px", textAlign:"center" }}>
                  <div style={{ fontSize:40, marginBottom:16 }}>🌱</div>
                  <p style={{ color:"#8a7050", fontSize:15 }}>Aún no hay respuestas. Comparte la encuesta para comenzar.</p>
                </div>
              ) : (
                <>
                  {[
                    { key:"q2", label:"Relación con el dinero" },
                    { key:"q3", label:"Mayor motivación" },
                    { key:"q4", label:"Principal obstáculo" },
                    { key:"q5", label:"Primera acción con asesor" },
                    { key:"q6", label:"Disposición de pago mensual" },
                    { key:"q1", label:"Tiempo en EE.UU." },
                  ].map(({ key, label }) => {
                    const entries = tally(responses, key);
                    return (
                      <div key={key} style={{ background:"white", borderRadius:14, padding:"24px", marginBottom:16, boxShadow:"0 2px 12px #2a1f1008" }}>
                        <p style={{ fontSize:11, color:"#b53515", textTransform:"uppercase", letterSpacing:".12em", fontWeight:600, marginBottom:16 }}>{label}</p>
                        {entries.map(([opt, n]) => (
                          <div key={opt} style={{ marginBottom:12 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                              <span style={{ fontSize:13, color:"#2a1f10", maxWidth:"72%" }}>{opt}</span>
                              <span style={{ fontSize:13, color:"#b53515", fontWeight:600 }}>{n} <span style={{ color:"#8a7050", fontWeight:400 }}>({pct(n,total)}%)</span></span>
                            </div>
                            <div style={{ height:8, background:"#f0e8dc", borderRadius:4, overflow:"hidden" }}>
                              <div className="bar-fill" style={{ "--w":`${pct(n,total)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  <div style={{ background:"white", borderRadius:14, padding:"24px", boxShadow:"0 2px 12px #2a1f1008" }}>
                    <p style={{ fontSize:11, color:"#b53515", textTransform:"uppercase", letterSpacing:".12em", fontWeight:600, marginBottom:16 }}>Respuestas abiertas — ¿Qué necesitan para confiar?</p>
                    {responses.filter(r => r.q7).length === 0
                      ? <p style={{ color:"#8a7050", fontSize:14 }}>Aún no hay respuestas abiertas.</p>
                      : responses.filter(r => r.q7).map((r, i) => (
                        <div key={i} style={{ borderLeft:"2px solid #e8c0bc", paddingLeft:14, marginBottom:16 }}>
                          <p style={{ fontSize:14, color:"#2a1f10", lineHeight:1.7, marginBottom:4 }}>"{r.q7}"</p>
                          <span style={{ fontSize:12, color:"#8a7050" }}>{r.name||"Anónimo"} · {r.city||"—"} · {(r.created_at||r.ts||'—').split('T')[0]}</span>
                        </div>
                      ))
                    }
                  </div>
                </>
              )}
            </div>
          )}

          {/* CONTACTS */}
          {adminView === "contacts" && (
            <div className="fade-in">
              <div style={{ background:"white", borderRadius:14, padding:"24px", boxShadow:"0 2px 12px #2a1f1008", marginBottom:16 }}>
                <p style={{ fontSize:11, color:"#b53515", textTransform:"uppercase", letterSpacing:".12em", fontWeight:600, marginBottom:4 }}>
                  Contactos ({responses.filter(r=>r.email).length} con email)
                </p>
                <p style={{ fontSize:13, color:"#8a7050", marginBottom:20 }}>Lista completa de personas registradas.</p>
                {responses.length === 0
                  ? <p style={{ color:"#8a7050", fontSize:14, textAlign:"center", padding:"32px" }}>Sin respuestas todavía.</p>
                  : (
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                        <thead>
                          <tr style={{ borderBottom:"2px solid #f0e8dc" }}>
                            {["Nombre","Email","Ciudad","Origen","Motivación","Pago/mes","Fecha"].map(h => (
                              <th key={h} style={{ padding:"10px 12px", textAlign:"left", color:"#8a7050", fontWeight:500, fontSize:11, textTransform:"uppercase", letterSpacing:".08em", whiteSpace:"nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {responses.map((r, i) => (
                            <tr key={i} className="admin-row" style={{ borderBottom:"1px solid #f0e8dc", transition:".15s" }}>
                              <td style={{ padding:"11px 12px", color:"#2a1f10" }}>{r.name||"—"}</td>
                              <td style={{ padding:"11px 12px" }}>
                                {r.email
                                  ? <a href={`mailto:${r.email}`} style={{ color:"#b53515", textDecoration:"none" }}>{r.email}</a>
                                  : <span style={{ color:"#c0b0a0" }}>—</span>}
                              </td>
                              <td style={{ padding:"11px 12px", color:"#5a4a30" }}>{r.city||"—"}</td>
                              <td style={{ padding:"11px 12px", color:"#5a4a30" }}>{r.origin||"—"}</td>
                              <td style={{ padding:"11px 12px" }}>{r.q3 ? <span className="tag">{r.q3.substring(0,26)}{r.q3.length>26?"…":""}</span> : "—"}</td>
                              <td style={{ padding:"11px 12px" }}>{r.q6 ? <span className="tag">{r.q6}</span> : "—"}</td>
                              <td style={{ padding:"11px 12px", color:"#8a7050", whiteSpace:"nowrap" }}>{(r.created_at||r.ts||'—').split('T')[0]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </div>

              {responses.filter(r=>r.email).length > 0 && (
                <div style={{ background:"white", borderRadius:14, padding:"24px", boxShadow:"0 2px 12px #2a1f1008" }}>
                  <p style={{ fontSize:11, color:"#b53515", textTransform:"uppercase", letterSpacing:".12em", fontWeight:600, marginBottom:12 }}>Emails para copiar</p>
                  <div style={{ background:"#f9f4ec", borderRadius:10, padding:"14px 16px", fontSize:13, color:"#2a1f10", lineHeight:2, wordBreak:"break-all" }}>
                    {responses.filter(r=>r.email).map(r=>r.email).join(", ")}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RAW */}
          {adminView === "raw" && (
            <div className="fade-in">
              {responses.length === 0 ? (
                <div style={{ background:"white", borderRadius:14, padding:"48px", textAlign:"center" }}>
                  <p style={{ color:"#8a7050", fontSize:15 }}>Sin respuestas todavía.</p>
                </div>
              ) : selectedRow ? (
                <div>
                  <button onClick={() => setSelectedRow(null)} style={{ background:"transparent", border:"none", color:"#b53515", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, marginBottom:20, display:"flex", alignItems:"center", gap:6 }}>
                    ← Volver a la lista
                  </button>
                  <div style={{ background:"white", borderRadius:14, padding:"28px", boxShadow:"0 2px 12px #2a1f1008" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
                      <div>
                        <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:"#1a0f05", marginBottom:4 }}>{selectedRow.name||"Anónimo"}</h3>
                        <p style={{ fontSize:13, color:"#8a7050" }}>{selectedRow.city} · {selectedRow.origin} · {selectedRow.ts?.split("T")[0]}</p>
                      </div>
                      <button onClick={() => deleteResponse(selectedRow.id)} style={{ background:"transparent", color:"#c05050", border:"1px solid #e0c0c0", borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                        Eliminar
                      </button>
                    </div>
                    {QUESTIONS.filter(q => q.id !== "q8").map(q => (
                      <div key={q.id} style={{ borderBottom:"1px solid #f0e8dc", paddingBottom:16, marginBottom:16 }}>
                        <p style={{ fontSize:11, color:"#b53515", textTransform:"uppercase", letterSpacing:".1em", marginBottom:5 }}>{q.eyebrow}</p>
                        <p style={{ fontSize:13, color:"#5a4a30", marginBottom:8 }}>{q.question}</p>
                        <p style={{ fontSize:15, color:"#1a0f05", lineHeight:1.6, background:"#f9f4ec", borderRadius:8, padding:"10px 14px" }}>
                          {selectedRow[q.id] || <em style={{ color:"#b0a090" }}>Sin respuesta</em>}
                        </p>
                      </div>
                    ))}
                    {selectedRow.email && (
                      <div style={{ background:"#fff7f5", borderRadius:10, padding:"14px 16px", marginTop:4 }}>
                        <span style={{ fontSize:12, color:"#8a7050" }}>Email: </span>
                        <a href={`mailto:${selectedRow.email}`} style={{ color:"#b53515", fontSize:14 }}>{selectedRow.email}</a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize:13, color:"#8a7050", marginBottom:16 }}>{responses.length} respuestas · Toca una para ver el detalle.</p>
                  {responses.map((r, i) => (
                    <div key={i} className="admin-row" onClick={() => setSelectedRow(r)}
                      style={{ background:"white", borderRadius:12, padding:"18px 20px", marginBottom:10, cursor:"pointer", boxShadow:"0 1px 8px #2a1f1006", display:"flex", justifyContent:"space-between", alignItems:"center", transition:".15s" }}>
                      <div>
                        <div style={{ fontSize:15, color:"#1a0f05", fontWeight:500, marginBottom:4 }}>{r.name||"Anónimo"}</div>
                        <div style={{ fontSize:12, color:"#8a7050" }}>{r.city||"—"} · {r.origin||"—"} · {(r.created_at||r.ts||'—').split('T')[0]}</div>
                        <div style={{ marginTop:6 }}>
                          {r.q3 && <span className="tag">{r.q3.substring(0,28)}{r.q3.length>28?"…":""}</span>}
                          {r.q6 && <span className="tag">{r.q6}</span>}
                        </div>
                      </div>
                      <span style={{ color:"#b53515", fontSize:20 }}>›</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ADMIN LOGIN ──────────────────────────────────────────────
  if (phase === "admin-login") return (
    <div style={{ minHeight:"100vh", background:"#1c0e06", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:20 }}>
      <style>{BASE_CSS}</style>
      <div style={{ background:"#2e1508", borderRadius:18, padding:"40px 32px", width:"100%", maxWidth:380, textAlign:"center", border:"1px solid #5a2a10" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:"white", marginBottom:28 }}>
          Nuestra <span style={{ color:"#e8a060" }}>Riqueza</span>
        </div>
        <p style={{ fontSize:13, color:"#8a6040", marginBottom:20 }}>Panel de administrador</p>
        <input className="fi" type="password" placeholder="Contraseña" value={adminInput}
          onChange={e => setAdminInput(e.target.value)} onKeyDown={e => e.key==="Enter" && tryAdmin()}
          style={{ background:"#1c0e06", borderColor: adminError?"#c05050":"#5a3020", color:"white", marginBottom:0 }} />
        {adminError && <p style={{ fontSize:12, color:"#e05050", marginTop:8 }}>Contraseña incorrecta</p>}
        <button className="btn-primary full" style={{ marginTop:16 }} onClick={tryAdmin}>Entrar</button>
        <button onClick={() => { setPhase("landing"); scrollTop(); }} style={{ background:"transparent", border:"none", color:"#5a3020", fontSize:13, cursor:"pointer", marginTop:14, fontFamily:"'DM Sans',sans-serif" }}>
          ← Volver
        </button>
      </div>
    </div>
  );

  // ── LANDING ──────────────────────────────────────────────────
  if (phase === "landing") return (
    <div style={{ minHeight:"100vh", background:"#f9f4ec", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{BASE_CSS}</style>
      <div ref={topRef} />
      <nav style={{ background:"white", borderBottom:"1px solid #ede5d8", padding:"14px 24px", position:"sticky", top:0, zIndex:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:"#1a0f05" }}>
          Nuestra <span style={{ color:"#b53515" }}>Riqueza</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span className="stat-pill">🌎 {displayCount}+ voces</span>
          {/* Hidden admin button — subtle dot */}
          <button onClick={() => setPhase("admin-login")} style={{ background:"transparent", border:"none", color:"#f9f4ec", fontSize:18, cursor:"pointer", lineHeight:1, padding:"0 4px" }} title="">·</button>
        </div>
      </nav>

      <header style={{ background:"linear-gradient(155deg,#1c0e06 0%,#2e1508 50%,#1a0c04 100%)", padding:"72px 24px 64px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(ellipse at 15% 85%,#b5351520,transparent 55%),radial-gradient(ellipse at 85% 15%,#d4843020,transparent 55%)" }} />
        <div style={{ position:"relative", maxWidth:560, margin:"0 auto" }}>
          <div className={visible?"fade-in":""} style={{ display:"inline-block", background:"#b5351522", border:"1px solid #b5351540", borderRadius:24, padding:"6px 18px", fontSize:12, color:"#e8a090", letterSpacing:".12em", textTransform:"uppercase", marginBottom:28 }}>
            Para nuestra comunidad latina en EE.UU.
          </div>
          <h1 className={visible?"fade-in":""} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(38px,9vw,58px)", color:"white", lineHeight:1.13, marginBottom:24, animationDelay:".1s" }}>
            Tu trabajo duro merece<br/><em style={{ color:"#e8a060" }}>más que una cuenta</em><br/>de ahorros.
          </h1>
          <p className={visible?"fade-in":""} style={{ fontSize:16, color:"#c8b49a", lineHeight:1.8, marginBottom:36, animationDelay:".2s" }}>
            Miles de latinos ganamos bien, trabajamos duro y aún así sentimos que el dinero nunca alcanza. No es tu culpa — el sistema financiero nunca fue diseñado para nosotros. <strong style={{ color:"#e8c090" }}>Estamos cambiando eso.</strong>
          </p>
          <div className={visible?"fade-in":""} style={{ animationDelay:".3s" }}>
            <button className="btn-primary" style={{ fontSize:17, padding:"18px 44px", animation:"glow 3s ease infinite" }} onClick={() => { setPhase("survey"); scrollTop(); }}>
              Quiero ser parte del cambio →
            </button>
            <p style={{ marginTop:14, fontSize:13, color:"#7a6040" }}>✦ Solo 3 minutos · 100% gratuito · Para ti y tu familia</p>
          </div>
        </div>
      </header>

      <div style={{ maxWidth:620, margin:"0 auto", padding:"0 20px 60px" }}>
        <section style={{ padding:"52px 0 36px" }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, color:"#1a0f05", marginBottom:8, lineHeight:1.25 }}>¿Te suena familiar?</h2>
          <p style={{ color:"#8a7050", fontSize:15, marginBottom:32, lineHeight:1.6 }}>Si alguna de estas frases resuena contigo, este espacio es para ti.</p>
          {[
            ["💸","Mandas remesas todos los meses pero no sabes cómo construir riqueza aquí al mismo tiempo."],
            ["😰","Tienes dinero en la cuenta pero no sabes si lo estás usando de la manera correcta."],
            ["🗣️","Has querido hablar con un asesor pero sientes que son para \"otros\", no para ti."],
            ["📈","Ves cómo otros invierten en bolsa o propiedades y no sabes por dónde empezar."],
            ["🌎","Quieres darle un mejor futuro a tu familia — aquí y en tu país — pero nadie te ha enseñado cómo."],
          ].map(([icon,text],i) => (
            <div key={i} className="pain-item" style={{ animationDelay:`${i*.07}s` }}>
              <span style={{ fontSize:22 }}>{icon}</span>
              <p style={{ color:"#2a1f10", fontSize:15, lineHeight:1.65 }}>{text}</p>
            </div>
          ))}
        </section>

        <section style={{ background:"white", borderRadius:18, padding:"36px 30px", marginBottom:32, boxShadow:"0 2px 24px #2a1f1006" }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:"#1a0f05", marginBottom:18, lineHeight:1.3 }}>Por qué esto importa ahora</h2>
          <p style={{ color:"#4a3520", fontSize:15, lineHeight:1.85, marginBottom:16 }}>
            La riqueza de las familias latinas en EE.UU. creció <strong>252% en la última década</strong>. Somos el grupo de mayor crecimiento económico del país.
          </p>
          <p style={{ color:"#4a3520", fontSize:15, lineHeight:1.85 }}>
            Y sin embargo, menos del <strong>3% de los asesores financieros certificados son hispanos</strong>. Casi nadie habla nuestro idioma — ni el español, ni el cultural. Eso es lo que queremos resolver.
          </p>
        </section>

        <section style={{ background:"linear-gradient(140deg,#1c0e06,#2e1508)", borderRadius:18, padding:"40px 30px", marginBottom:32, textAlign:"center" }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:54, color:"#b53515", fontWeight:700, lineHeight:1, marginBottom:8, animation:"heartbeat 2.5s ease infinite" }}>{displayCount}+</div>
          <p style={{ color:"#c8b49a", fontSize:15, marginBottom:24, lineHeight:1.6 }}>latinos ya compartieron su historia y están esperando el lanzamiento</p>
          <div style={{ display:"flex", justifyContent:"center", gap:16, flexWrap:"wrap" }}>
            {[["🇩🇴","Rep. Dom."],["🇲🇽","México"],["🇵🇷","Puerto Rico"],["🇸🇻","El Salvador"],["🇨🇴","Colombia"]].map(([f,n])=>(
              <span key={n} style={{ fontSize:13, color:"#8a6840" }}>{f} {n}</span>
            ))}
          </div>
        </section>

        <div style={{ textAlign:"center" }}>
          <p style={{ color:"#8a7050", fontSize:14, marginBottom:20, lineHeight:1.7 }}>Toma 3 minutos. Es completamente gratis.<br/>Y puede cambiar cómo ves tu dinero para siempre.</p>
          <button className="btn-primary" style={{ fontSize:17, padding:"18px 44px" }} onClick={() => { setPhase("survey"); scrollTop(); }}>
            Comenzar ahora →
          </button>
        </div>
      </div>
    </div>
  );

  // ── SURVEY ───────────────────────────────────────────────────
  if (phase === "survey") return (
    <div style={{ minHeight:"100vh", background:"#f9f4ec", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{BASE_CSS}</style>
      <div ref={topRef} />
      <div style={{ position:"sticky", top:0, zIndex:20, background:"white", borderBottom:"1px solid #ede5d8" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 20px" }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700, color:"#1a0f05" }}>
            Nuestra <span style={{ color:"#b53515" }}>Riqueza</span>
          </div>
          <span style={{ fontSize:12, color:"#8a7050" }}>{step+1} de {QUESTIONS.length}</span>
        </div>
        <div style={{ height:3, background:"#ede5d8" }}>
          <div className="progress-fill" style={{ height:"100%", background:"linear-gradient(90deg,#b53515,#d4843a)", width:`${progress}%` }} />
        </div>
      </div>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"40px 20px 60px" }}>
        <div className={transitioning?"fade-out":"fade-in"}>
          {step > 0 && TRANSITIONS[step] && (
            <div style={{ background:"#fff8f0", border:"1px solid #e8d0a0", borderRadius:10, padding:"11px 16px", marginBottom:28, fontSize:14, color:"#8a6030", fontStyle:"italic" }}>
              ✦ {TRANSITIONS[step]}
            </div>
          )}
          <p style={{ fontSize:11, color:"#b53515", textTransform:"uppercase", letterSpacing:".14em", fontWeight:600, marginBottom:10 }}>{q.eyebrow}</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(22px,5vw,28px)", color:"#1a0f05", marginBottom:28, lineHeight:1.35 }}>{q.question}</h2>

          {q.type === "radio" && q.options.map((opt,i) => (
            <button key={i} className={`opt-btn${answers[q.id]===opt?" sel":""}`} onClick={()=>next(opt)}>
              <span className="dot">{answers[q.id]===opt?"✓":""}</span>{opt}
            </button>
          ))}

          {q.type === "text" && (
            <>
              <textarea className="ta" placeholder={q.placeholder} value={answers[q.id]||""} onChange={e=>setAnswers({...answers,[q.id]:e.target.value})} />
              <div style={{ marginTop:16 }}>
                <button className="btn-primary" onClick={()=>next(answers[q.id]||"")} disabled={!answers[q.id]?.trim()}>Continuar →</button>
              </div>
            </>
          )}

          {q.type === "profile" && (
            <>
              <p style={{ color:"#8a7050", fontSize:14, marginBottom:22, lineHeight:1.65 }}>Queremos avisarte personalmente cuando lancemos. Tu información es privada y nunca la compartiremos.</p>
              {[
                {k:"name",   label:"Tu nombre (opcional)",   ph:"¿Cómo te llamas?"},
                {k:"city",   label:"Ciudad donde vives",     ph:"Ej: Boston MA · Clarksville TN"},
                {k:"origin", label:"País de origen",         ph:"Ej: República Dominicana"},
                {k:"email",  label:"Tu email para avisarte", ph:"tu@email.com"},
              ].map(({k,label,ph})=>(
                <div key={k}>
                  <label style={{ display:"block", fontSize:11, color:"#8a7050", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>{label}</label>
                  <input className="fi" placeholder={ph} value={answers[k]||""} onChange={e=>setAnswers({...answers,[k]:e.target.value})} />
                </div>
              ))}
              <button className="btn-primary full" style={{ marginTop:8 }} onClick={()=>next(answers.city||"")}>Unirme a la comunidad ✦</button>
              <p style={{ fontSize:12, color:"#aaa090", textAlign:"center", marginTop:12 }}>🔒 Tu información es privada. Nunca la vendemos.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ── RESULT ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#f9f4ec", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{BASE_CSS}</style>
      <div ref={topRef} />
      <div style={{ background:"linear-gradient(155deg,#1c0e06,#2e1508)", padding:"28px 24px 24px", textAlign:"center" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:"white" }}>
          Nuestra <span style={{ color:"#e8a060" }}>Riqueza</span>
        </div>
      </div>
      <div style={{ maxWidth:620, margin:"0 auto", padding:"40px 20px 60px" }}>
        <div className="float-in">
          <div className="result-card" style={{ borderTop:"4px solid #b53515", textAlign:"center", paddingTop:36 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🌱</div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, color:"#1a0f05", marginBottom:16, lineHeight:1.3 }}>
              {answers.name ? `${answers.name}, gracias.` : "Gracias por tu honestidad."}
            </h2>
            <p style={{ fontSize:16, color:"#3a2c1a", lineHeight:1.85 }}>{getResultMessage(answers)}</p>
          </div>

          <div className="result-card" style={{ background:"linear-gradient(135deg,#fff7f3,#fffdf9)", border:"1.5px solid #e8c8bc" }}>
            <p style={{ fontSize:11, color:"#b53515", textTransform:"uppercase", letterSpacing:".14em", fontWeight:600, marginBottom:14 }}>Lo que tu historia nos dice</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[{label:"Tu motivación",value:answers.q3},{label:"Lo que te ha frenado",value:answers.q4},{label:"Tu primer paso",value:answers.q5}]
                .filter(x=>x.value).map(({label,value})=>(
                <div key={label} style={{ background:"white", borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ fontSize:11, color:"#8a7050", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:14, color:"#2a1f10", lineHeight:1.5 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="result-card" style={{ background:"linear-gradient(140deg,#1c0e06,#2e1508)", color:"white", textAlign:"center" }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, marginBottom:14, lineHeight:1.3 }}>Ahora eres parte de algo más grande.</div>
            <p style={{ color:"#c8b49a", fontSize:15, lineHeight:1.8, marginBottom:24 }}>
              Cada respuesta que das construye el servicio financiero que nuestra comunidad merece. Te avisaremos personalmente{answers.email?` a ${answers.email}`:""} cuando lancemos.
            </p>
            <div style={{ background:"#b5351522", borderRadius:12, padding:"16px 20px", marginBottom:24 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, color:"#e8a060", fontWeight:700 }}>{displayCount}+</div>
              <div style={{ fontSize:13, color:"#8a6840", marginTop:4 }}>latinos ya están esperando este momento</div>
            </div>
            <p style={{ fontSize:14, color:"#c8b49a", lineHeight:1.7 }}>
              <strong style={{ color:"white" }}>¿Conoces a alguien que necesite esto?</strong><br/>
              Compártelo con un familiar o amigo. Cada historia que sumamos nos hace más fuertes.
            </p>
          </div>

          <div style={{ textAlign:"center", marginTop:8 }}>
            <button className="btn-primary" onClick={()=>{ setPhase("landing"); setStep(0); setAnswers({}); scrollTop(); }}>
              Compartir con alguien más →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
