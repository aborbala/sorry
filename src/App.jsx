import { useState, useEffect } from "react";

const App = () => {
  const [section1Count, setSection1Count] = useState(0);
  const [section2Count, setSection2Count] = useState(0);
  const [tableData, setTableData] = useState([]);

  const currentMonthDate = `${new Date().toISOString().slice(0, 7)}-01`;
  const currentMonthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(new Date());

  // Fetch counts from our Sheets API
  const fetchCounts = async () => {
    try {
      const res = await fetch(`/api/counts?month=${currentMonthDate}`);
      const json = await res.json();
      setSection1Count(json.felix);
      setSection2Count(json.anna);
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  // Fetch full table from Sheets API
  const fetchTableData = async () => {
    try {
      const res = await fetch("/api/table");
      const data = await res.json();
      setTableData(data);
    } catch (err) {
      console.error("Error fetching table data:", err);
    }
  };

  // Push updates to Sheets API
  const updateCounts = async (newFelix, newAnna) => {
    try {
      await fetch("/api/counts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: currentMonthDate,
          felix: newFelix,
          anna: newAnna,
        }),
      });
      // refresh
      fetchTableData();
    } catch (err) {
      console.error("Error updating counts:", err);
    }
  };

  // Prevent negative counts
  const handleSection1Count = (delta) => {
    const next = section1Count + delta;
    if (next < 0) return;
    setSection1Count(next);
    updateCounts(next, section2Count);
  };

  const handleSection2Count = (delta) => {
    const next = section2Count + delta;
    if (next < 0) return;
    setSection2Count(next);
    updateCounts(section1Count, next);
  };

  useEffect(() => {
    fetchCounts();
    fetchTableData();
  }, []);

  return (
    <>
      {/* Rainbow banner with marquee */}
      <div
        style={{
          width: '100%',
          overflow: 'hidden',
          background: 'linear-gradient(270deg, red, orange, yellow, green, blue, indigo, violet)',
          backgroundSize: '1400% 1400%',
          animation: 'rainbow 5s ease infinite',
          textAlign: 'center',
          padding: '10px',
        }}
      >
        <marquee behavior="scroll" scrollamount="5">
          🚀🎉 New Release: v2 Out! 🎉🚀 Negative values are now not allowed! Available NOW!
        </marquee>
      </div>
      {/* Keyframes for background animation */}
      <style>{`@keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }`}</style>
         {/* Kitschy Score Display */}
      <div
        style={{
          margin: '20px auto',
          textAlign: 'center',
          fontFamily: "'Comic Sans MS', cursive, sans-serif",
          fontSize: '3rem',
          color: '#fff',
          textShadow: '2px 2px 0 #000, -2px -2px 0 #000',
          backgroundColor: 'hotpink',
          border: '5px dashed yellow',
          padding: '20px',
          animation: 'blink 1s infinite',
          width: '80%',
        }}
      >
        <marquee behavior="alternate" scrollamount="10">
          ⚡️ {new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date())}: Felix {section1Count} vs. Anna {section2Count} ⚡️
        </marquee>
      </div>

      <div>
{/* Controls - aligned center with gap */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '40px',
          margin: '20px 0',
        }}
      >
        {/* Felix Control */}
        <div style={{
          backgroundColor: '#ff69b4',
          padding: '10px',
          borderRadius: '10px',
          boxShadow: '0 0 10px #ff1493',
          textAlign: 'center',
          width: '160px',
        }}>
          <h2 style={{
            fontFamily: "'Comic Sans MS', cursive, sans-serif",
            fontSize: '2rem',
            margin: '0',
            textShadow: '1px 1px 0 #000',
          }}>Felix</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '10px 0' }}>
            <button onClick={() => handleSection1Count(1)} style={{ fontSize: '1.5rem' }}>+</button>
            <button onClick={() => handleSection1Count(-1)} disabled={section1Count === 0} style={{ fontSize: '1.5rem' }}>-</button>
          </div>
        </div>

        {/* Anna Control */}
        <div style={{
          backgroundColor: '#00ffff',
          padding: '10px',
          borderRadius: '10px',
          boxShadow: '0 0 10px #00ced1',
          textAlign: 'center',
          width: '160px',
        }}>
          <h2 style={{
            fontFamily: "'Comic Sans MS', cursive, sans-serif",
            fontSize: '2rem',
            margin: '0',
            textShadow: '1px 1px 0 #000',
          }}>Anna</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '10px 0' }}>
            <button onClick={() => handleSection2Count(1)} style={{ fontSize: '1.5rem' }}>+</button>
            <button onClick={() => handleSection2Count(-1)} disabled={section2Count === 0} style={{ fontSize: '1.5rem' }}>-</button>
          </div>
        </div>
      </div>

      {/* Monthly Records - highlight higher scores (higher is worse) */}
      <div style={{
        margin: '20px',
        padding: '15px',
        background: 'linear-gradient(90deg, #ff0, #f0f, #0ff)',
        animation: 'rainbow 5s ease infinite',
        borderRadius: '12px',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontFamily: "'Comic Sans MS', cursive, sans-serif",
          fontSize: '2.5rem',
          textShadow: '2px 2px 0 #000',
          color: '#000',
        }}>Monthly Records (Higher Is Worse!)</h2>
        <table border="3" style={{
          width: '100%',
          borderColor: 'magenta',
          fontFamily: "'Comic Sans MS', cursive, sans-serif",
          textAlign: 'center',
          backgroundColor: '#fff0f5',
        }}>
          <thead style={{ backgroundColor: 'purple', color: 'white' }}>
            <tr>
              <th>Month</th>
              <th>Anna</th>
              <th>Felix</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.month} style={{ borderBottom: '2px dashed hotpink' }}>
                <td style={{ padding: '8px' }}>{new Date(row.month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</td>
                <td style={{ padding: '8px' }}>
                  {row.anna}
                  {row.anna < row.felix && (
                    <img
                      src="https://static.wixstatic.com/media/e6f56d_a2b47380e8504300bfb2844e4a8a5159~mv2.gif"
                      alt="prosciutto"
                      style={{ width: "24px", marginLeft: "6px" }}
                    />
                  )}
                </td>
                <td style={{ padding: '8px' }}>
                  {row.felix}
                  {row.felix < row.anna && (
                    <img
                      src="https://static.wixstatic.com/media/e6f56d_a2b47380e8504300bfb2844e4a8a5159~mv2.gif"
                      alt="prosciutto"
                      style={{ width: "24px", marginLeft: "6px" }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      </div>
    </>
  );
};

export default App;
