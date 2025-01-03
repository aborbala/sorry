import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const App = () => {
  const [section1Count, setSection1Count] = useState(0);
  const [section2Count, setSection2Count] = useState(0);
  const [tableData, setTableData] = useState([]);

  const currentMonthDate = `${new Date().toISOString().slice(0, 7)}-01`; // YYYY-MM-01
  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()); // e.g., "December"

  // Fetch counts for the current month from Supabase
  const fetchCounts = async () => {
    const { data, error } = await supabase
      .from('counts')
      .select('*')
      .eq('month', currentMonthDate)
      .single();

    if (error) {
      console.error('Error fetching counts:', error);
    } else if (data) {
      setSection1Count(data.felix || 0);
      setSection2Count(data.anna || 0);
    }
  };

  // Fetch all data for the table
  const fetchTableData = async () => {
    const { data, error } = await supabase
      .from('counts')
      .select('*')
      .order('month', { ascending: true });

    if (error) {
      console.error('Error fetching table data:', error);
    } else {
      setTableData(data);
    }
  };

  // Update counts in Supabase
  const updateCounts = async (newFelixCount, newAnnaCount) => {
    const { error } = await supabase.from('counts').upsert({
      month: currentMonthDate, // Full date (YYYY-MM-01)
      felix: newFelixCount,
      anna: newAnnaCount,
    }, { onConflict: 'month' });

    if (error) {
      console.error('Error updating/inserting counts:', error);
    } else {
      fetchTableData(); // Refresh table data
    }
  };

  // Handle button clicks
  const handleSection1Count = (increment) => {
    const newCount = section1Count + increment;
    setSection1Count(newCount);
    updateCounts(newCount, section2Count);
  };

  const handleSection2Count = (increment) => {
    const newCount = section2Count + increment;
    setSection2Count(newCount);
    updateCounts(section1Count, newCount);
  };

  useEffect(() => {
    fetchCounts(); // Fetch data on component mount
    fetchTableData(); // Fetch table data on component mount
  }, []);

  return (
    <div>
      <img
        src="https://static.wixstatic.com/media/e6f56d_a2b47380e8504300bfb2844e4a8a5159~mv2.gif"
        alt="banana"
        style={{ width: '30px' }}
      />
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
      <h2>Monthly Data</h2>
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
              <td>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(row.month))}</td>
              <td>{row.anna || 0}</td>
              <td>{row.felix || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
