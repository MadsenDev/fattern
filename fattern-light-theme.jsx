const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.f-root {
  font-family: 'Inter', sans-serif;
  height: 640px;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(0,0,0,0.08);
}

.f-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 70% 50% at 10% 15%, rgba(45,180,130,0.10) 0%, transparent 55%),
    radial-gradient(ellipse 55% 45% at 88% 85%, rgba(80,140,220,0.08) 0%, transparent 50%),
    radial-gradient(ellipse 45% 35% at 65% 5%, rgba(160,100,220,0.05) 0%, transparent 45%),
    linear-gradient(160deg, #F0F7F3 0%, #EEF3F9 50%, #F2EFF8 100%);
  z-index: 0;
}
.f-orb1 {
  position: absolute; width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(45,180,130,0.12) 0%, transparent 70%);
  top: -80px; left: -60px; z-index: 0; filter: blur(50px);
}
.f-orb2 {
  position: absolute; width: 260px; height: 260px; border-radius: 50%;
  background: radial-gradient(circle, rgba(80,140,220,0.10) 0%, transparent 70%);
  bottom: -60px; right: 30px; z-index: 0; filter: blur(50px);
}

.f-content { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; }

.f-topbar {
  height: 40px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 18px; flex-shrink: 0;
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(0,0,0,0.07);
}
.f-brand { display: flex; align-items: center; gap: 9px; }
.f-brand-mark {
  width: 22px; height: 22px; border-radius: 6px;
  background: linear-gradient(135deg, #2abd8a, #1e9070);
  border: 1px solid rgba(45,180,130,0.3);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 6px rgba(45,180,130,0.25);
}
.f-brand-mark span { font-size: 11px; font-weight: 700; color: #fff; }
.f-brand-name { font-size: 13px; font-weight: 600; color: #1a1f1c; letter-spacing: -0.01em; }
.f-win-btns { display: flex; gap: 6px; }
.f-win-btn { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; border: none; }

.f-layout { display: flex; flex: 1; overflow: hidden; }

.f-rail {
  width: 52px; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  padding: 14px 0; gap: 3px;
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(0,0,0,0.06);
}
.f-rail-item {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: rgba(0,0,0,0.28); font-size: 17px;
  position: relative; transition: all 0.15s; border: 1px solid transparent;
}
.f-rail-item:hover { background: rgba(0,0,0,0.05); color: rgba(0,0,0,0.55); }
.f-rail-item.active {
  background: rgba(45,180,130,0.12);
  border-color: rgba(45,180,130,0.3);
  color: #1a9068;
  box-shadow: 0 0 10px rgba(45,180,130,0.12);
}
.f-rail-badge {
  position: absolute; top: 5px; right: 5px; width: 6px; height: 6px;
  border-radius: 50%; background: #2abd8a;
  border: 1.5px solid rgba(255,255,255,0.9);
  box-shadow: 0 0 4px rgba(45,180,130,0.5);
}
.f-rail-div { width: 20px; height: 1px; background: rgba(0,0,0,0.07); margin: 4px 0; }
.f-rail-spacer { flex: 1; }

.f-tt-wrap { position: relative; }
.f-tt {
  position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0,0,0,0.1);
  color: #1a1f1c;
  font-size: 11.5px; font-weight: 500; white-space: nowrap;
  padding: 5px 10px; border-radius: 7px; pointer-events: none;
  opacity: 0; transition: opacity 0.12s; z-index: 999;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.f-tt::before {
  content: ''; position: absolute; right: 100%; top: 50%; transform: translateY(-50%);
  border: 4px solid transparent; border-right-color: rgba(0,0,0,0.1);
}
.f-tt-wrap:hover .f-tt { opacity: 1; }

.f-main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }

.f-hero { padding: 22px 24px 18px; flex-shrink: 0; }
.f-hero-glass {
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 16px;
  padding: 20px 22px 0; overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.9) inset;
}
.f-hero-row { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 14px; }
.f-period { font-size: 10px; font-weight: 500; color: rgba(0,0,0,0.35); letter-spacing: 0.13em; text-transform: uppercase; font-family: 'DM Mono', monospace; margin-bottom: 6px; }
.f-figure { font-size: 44px; font-weight: 700; color: #1a1f1c; letter-spacing: -0.04em; line-height: 1; }
.f-figure em { color: #1a9068; font-style: normal; }
.f-figure-sub { font-size: 11px; color: rgba(26,144,104,0.8); margin-top: 5px; font-family: 'DM Mono', monospace; }
.f-hero-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.f-hstat { text-align: right; }
.f-hstat-val { font-size: 16px; font-weight: 600; color: #1a1f1c; letter-spacing: -0.02em; }
.f-hstat-val.warn { color: #b07010; }
.f-hstat-val.danger { color: #b83820; }
.f-hstat-label { font-size: 10px; color: rgba(0,0,0,0.35); font-family: 'DM Mono', monospace; margin-top: 1px; }
.f-sparkline { display: flex; align-items: flex-end; gap: 3px; height: 42px; }
.f-sbar { flex: 1; border-radius: 2px 2px 0 0; background: rgba(45,180,130,0.25); }
.f-sbar.now { background: rgba(26,144,104,0.7); box-shadow: 0 0 6px rgba(45,180,130,0.3); }
.f-spark-x { display: flex; gap: 3px; border-top: 1px solid rgba(0,0,0,0.07); padding: 6px 0 14px; }
.f-spark-xl { flex: 1; font-size: 9px; color: rgba(0,0,0,0.28); text-align: center; font-family: 'DM Mono', monospace; letter-spacing: 0.05em; }

.f-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; padding: 0 24px 18px; }
.f-card {
  border-radius: 12px; padding: 14px 16px; position: relative; overflow: hidden;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.9);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.f-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.09), 0 1px 0 rgba(255,255,255,0.9) inset; }
.f-shimmer { position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 2px 2px 0 0; }
.f-card.cg .f-shimmer { background: linear-gradient(90deg, transparent, rgba(45,180,130,0.5), transparent); }
.f-card.ca .f-shimmer { background: linear-gradient(90deg, transparent, rgba(200,140,20,0.5), transparent); }
.f-card.cn .f-shimmer { background: linear-gradient(90deg, transparent, rgba(0,0,0,0.12), transparent); }
.f-card-label { font-size: 10px; font-weight: 500; color: rgba(0,0,0,0.38); letter-spacing: 0.1em; text-transform: uppercase; font-family: 'DM Mono', monospace; margin-bottom: 8px; }
.f-card-val { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 3px; }
.f-card.cg .f-card-val { color: #1a9068; }
.f-card.ca .f-card-val { color: #b07010; }
.f-card.cn .f-card-val { color: #1a1f1c; }
.f-card-meta { font-size: 11px; color: rgba(0,0,0,0.35); font-family: 'DM Mono', monospace; }
.f-card.cg .f-card-meta { color: rgba(26,144,104,0.7); }

.f-section { padding: 0 24px 20px; }
.f-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.f-section-title { font-size: 10.5px; font-weight: 600; color: rgba(0,0,0,0.32); letter-spacing: 0.1em; text-transform: uppercase; }
.f-section-link { font-size: 11.5px; color: #1a9068; font-weight: 500; cursor: pointer; }

.f-table-wrap {
  border-radius: 12px; overflow: hidden;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.9);
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}
.f-thead {
  display: grid; grid-template-columns: 86px 1fr 86px 74px 96px; gap: 10px;
  padding: 8px 16px;
  background: rgba(0,0,0,0.025);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.f-th { font-size: 9.5px; font-weight: 600; color: rgba(0,0,0,0.3); letter-spacing: 0.1em; text-transform: uppercase; font-family: 'DM Mono', monospace; }
.f-th:last-child { text-align: right; }
.f-trow {
  display: grid; grid-template-columns: 86px 1fr 86px 74px 96px; gap: 10px;
  padding: 10px 16px; border-bottom: 1px solid rgba(0,0,0,0.05);
  cursor: pointer; transition: background 0.1s; align-items: center;
}
.f-trow:last-child { border-bottom: none; }
.f-trow:hover { background: rgba(0,0,0,0.025); }
.f-td-num { font-size: 11px; color: rgba(0,0,0,0.32); font-family: 'DM Mono', monospace; }
.f-td-name { font-size: 12.5px; font-weight: 500; color: #1a1f1c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.f-td-date { font-size: 11px; color: rgba(0,0,0,0.32); font-family: 'DM Mono', monospace; }
.f-td-amount { font-size: 12.5px; font-weight: 600; color: #1a1f1c; text-align: right; font-family: 'DM Mono', monospace; }

.f-pill { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 500; border-radius: 5px; padding: 3px 7px; font-family: 'DM Mono', monospace; }
.f-pill-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
.f-pill.paid { background: rgba(45,180,130,0.1); color: #1a7a54; border: 1px solid rgba(45,180,130,0.2); }
.f-pill.sent { background: rgba(40,100,200,0.09); color: #1555a0; border: 1px solid rgba(40,100,200,0.18); }
.f-pill.draft { background: rgba(0,0,0,0.05); color: rgba(0,0,0,0.4); border: 1px solid rgba(0,0,0,0.09); }
.f-pill.overdue { background: rgba(200,60,30,0.09); color: #a03020; border: 1px solid rgba(200,60,30,0.18); }

.f-bottom {
  margin-top: auto; padding: 9px 24px;
  border-top: 1px solid rgba(0,0,0,0.07);
  display: flex; align-items: center; gap: 4px; flex-shrink: 0;
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(20px);
}
.f-co-pill {
  display: flex; align-items: center; gap: 7px;
  background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.07);
  border-radius: 20px; padding: 4px 12px 4px 6px; margin-right: 10px;
}
.f-co-av {
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(45,180,130,0.18); border: 1px solid rgba(45,180,130,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700; color: #1a9068;
}
.f-co-name { font-size: 11px; color: rgba(0,0,0,0.5); font-weight: 500; }
.f-sc { display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 6px; cursor: pointer; }
.f-sc:hover { background: rgba(0,0,0,0.04); }
.f-sc-label { font-size: 11.5px; color: rgba(0,0,0,0.38); }
.f-sc-key { font-size: 10px; color: rgba(0,0,0,0.3); background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; padding: 1px 5px; font-family: 'DM Mono', monospace; }
.f-bar-right { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 10.5px; color: rgba(0,0,0,0.28); font-family: 'DM Mono', monospace; }
.f-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #2abd8a; box-shadow: 0 0 5px rgba(45,180,130,0.5); flex-shrink: 0; }

::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 2px; }
`;

export default function App() {
  return (
    <>
      <style>{styles}</style>

      <div className="f-root">
        <div className="f-bg" />
        <div className="f-orb1" />
        <div className="f-orb2" />

        <div className="f-content">
          <div className="f-topbar">
            <div className="f-brand">
              <div className="f-brand-mark"><span>F</span></div>
              <span className="f-brand-name">Fattern</span>
            </div>
            <div className="f-win-btns">
              <button className="f-win-btn" style={{background:"#f0c060"}} />
              <button className="f-win-btn" style={{background:"#70c87a"}} />
              <button className="f-win-btn" style={{background:"#f07060"}} />
            </div>
          </div>

          <div className="f-layout">
            <div className="f-rail">
              {[
                { icon: "ti-layout-dashboard", label: "Oversikt", active: true },
                { icon: "ti-file-invoice", label: "Fakturaer", badge: true },
                { icon: "ti-receipt", label: "Utgifter" },
              ].map(item => (
                <div className="f-tt-wrap" key={item.label}>
                  <div className={`f-rail-item ${item.active ? "active" : ""}`}>
                    <i className={`ti ${item.icon}`} />
                    {item.badge && <div className="f-rail-badge" />}
                  </div>
                  <div className="f-tt">{item.label}</div>
                </div>
              ))}

              <div className="f-rail-div" />

              {[
                { icon: "ti-users", label: "Kunder" },
                { icon: "ti-package", label: "Produkter" },
                { icon: "ti-calendar-stats", label: "Budsjettår" },
              ].map(item => (
                <div className="f-tt-wrap" key={item.label}>
                  <div className="f-rail-item"><i className={`ti ${item.icon}`} /></div>
                  <div className="f-tt">{item.label}</div>
                </div>
              ))}

              <div className="f-rail-spacer" />
              <div className="f-rail-div" />

              <div className="f-tt-wrap">
                <div className="f-rail-item"><i className="ti ti-settings" /></div>
                <div className="f-tt">Innstillinger</div>
              </div>
            </div>

            <div className="f-main">
              <div className="f-hero">
                <div className="f-hero-glass">
                  <div className="f-hero-row">
                    <div>
                      <div className="f-period">Nettoinntekt · Mai 2025</div>
                      <div className="f-figure">kr <em>67</em> 850</div>
                      <div className="f-figure-sub">↑ 18% fra april · budsjettår 2025</div>
                    </div>
                    <div className="f-hero-stats">
                      <div className="f-hstat">
                        <div className="f-hstat-val warn">kr 41 350</div>
                        <div className="f-hstat-label">ubetalt</div>
                      </div>
                      <div className="f-hstat">
                        <div className="f-hstat-val danger">kr 32 000</div>
                        <div className="f-hstat-label">forfalt</div>
                      </div>
                    </div>
                  </div>
                  <div className="f-sparkline">
                    {[34,26,46,30,50,40].map((h,i) => (
                      <div key={i} className={`f-sbar ${i===5?"now":""}`} style={{height:`${h}px`}} />
                    ))}
                  </div>
                  <div className="f-spark-x">
                    {["DES","JAN","FEB","MAR","APR","MAI"].map(m => (
                      <div key={m} className="f-spark-xl">{m}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="f-cards">
                <div className="f-card cg"><div className="f-shimmer"/><div className="f-card-label">Inntekter</div><div className="f-card-val">kr 84 050</div><div className="f-card-meta">↑ 18% fra april</div></div>
                <div className="f-card ca"><div className="f-shimmer"/><div className="f-card-label">Utgifter</div><div className="f-card-val">kr 16 200</div><div className="f-card-meta">Registrerte kostnader</div></div>
                <div className="f-card cn"><div className="f-shimmer"/><div className="f-card-label">Innkrevingstakt</div><div className="f-card-val" style={{color:"#b07010"}}>73%</div><div className="f-card-meta">av fakturert beløp</div></div>
              </div>

              <div className="f-section">
                <div className="f-section-head">
                  <div className="f-section-title">Siste fakturaer</div>
                  <div className="f-section-link">Vis alle →</div>
                </div>
                <div className="f-table-wrap">
                  <div className="f-thead">
                    <div className="f-th">Nummer</div>
                    <div className="f-th">Kunde</div>
                    <div className="f-th">Status</div>
                    <div className="f-th">Dato</div>
                    <div className="f-th" style={{textAlign:"right"}}>Beløp</div>
                  </div>
                  {[
                    { num:"2025-047", name:"Designbyrå Halden AS", status:"paid",    label:"Betalt", date:"12.05.25", amount:"kr 24 500" },
                    { num:"2025-046", name:"Nordic Web Solutions",  status:"sent",    label:"Sendt",  date:"08.05.25", amount:"kr 8 750"  },
                    { num:"2025-045", name:"Østfold Kommune",       status:"overdue", label:"Forfalt",date:"01.05.25", amount:"kr 32 000" },
                    { num:"2025-043", name:"Halden Eiendom AS",     status:"draft",   label:"Utkast", date:"25.04.25", amount:"kr 15 600" },
                  ].map(row => (
                    <div className="f-trow" key={row.num}>
                      <div className="f-td-num">{row.num}</div>
                      <div className="f-td-name">{row.name}</div>
                      <div><span className={`f-pill ${row.status}`}><span className="f-pill-dot"/>{row.label}</span></div>
                      <div className="f-td-date">{row.date}</div>
                      <div className="f-td-amount">{row.amount}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="f-bottom">
                <div className="f-co-pill">
                  <div className="f-co-av">MD</div>
                  <span className="f-co-name">Madsen Utvikling</span>
                </div>
                {[["Ny faktura","⌘ N"],["Registrer betaling","⌘ P"],["Legg til utgift","⌘ E"]].map(([label,key]) => (
                  <div className="f-sc" key={label}>
                    <span className="f-sc-label">{label}</span>
                    <span className="f-sc-key">{key}</span>
                  </div>
                ))}
                <div className="f-bar-right">
                  <div className="f-status-dot" />
                  lokal · v0.6.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
