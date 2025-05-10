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

  const handleSection1Count = (delta) => {
    const next = section1Count + delta;
    setSection1Count(next);
    updateCounts(next, section2Count);
  };

  const handleSection2Count = (delta) => {
    const next = section2Count + delta;
    setSection2Count(next);
    updateCounts(section1Count, next);
  };

  useEffect(() => {
    fetchCounts();
    fetchTableData();
  }, []);

  return (
    <div>
      <h1>Monthly Counter</h1>
      <h2>{currentMonthName}</h2>
      <div>
        <h2>Felix</h2>
        <button onClick={() => handleSection1Count(1)}>+</button>
        <button onClick={() => handleSection1Count(-1)}>-</button>
        <p>Count: {section1Count}</p>
      </div>
      <div>
        <h2>Anna</h2>
        <button onClick={() => handleSection2Count(1)}>+</button>
        <button onClick={() => handleSection2Count(-1)}>-</button>
        <p>Count: {section2Count}</p>
      </div>

      <h2>Monthly Records</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Month</th>
            <th>Anna</th>
            <th>Felix</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row.month}>
              <td>
                {new Date(row.month).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </td>
              <td>
                {row.anna}
                {row.anna < row.felix && (
                  <img
                    src="https://static.wixstatic.com/media/e6f56d_a2b47380e8504300bfb2844e4a8a5159~mv2.gif"
                    alt="banana"
                    style={{ width: "20px", marginLeft: "5px" }}
                  />
                )}
              </td>
              <td>
                {row.felix}
                {row.felix < row.anna && (
                  <img
                    src="https://static.wixstatic.com/media/e6f56d_a2b47380e8504300bfb2844e4a8a5159~mv2.gif"
                    alt="banana"
                    style={{ width: "20px", marginLeft: "5px" }}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
