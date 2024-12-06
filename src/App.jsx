import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const App = () => {
  const [section1Count, setSection1Count] = useState(0);
  const [section2Count, setSection2Count] = useState(0);

  const currentMonthDate = `${new Date().toISOString().slice(0, 7)}-01`; // YYYY-MM-01

  // Fetch counts from Supabase
  const fetchCounts = async () => {
    const { data, error } = await supabase
      .from('counts')
      .select('*')
      .eq('month', currentMonthDate) // Full date
      .single();

    if (error) console.error('Error fetching counts:', error);
    else if (data) {
      setSection1Count(data.felix);
      setSection2Count(data.anna);
    }
  };

  // Update counts in Supabase
  const updateCounts = async () => {
    const { error } = await supabase.from('counts').upsert({
      month: currentMonthDate, // Full date (YYYY-MM-01)
      felix: section1Count,
      anna: section2Count,
    }, { onConflict: 'month' }); // Use the unique "month" column for conflict resolution
  
    if (error) {
      console.error('Error updating/inserting counts:', error);
    }
  };
  

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    updateCounts();
  }, [section1Count, section2Count]);

  return (
    <div>
      <h1>Monthly Counter</h1>
      <div>
        <h2>Section 1</h2>
        <button onClick={() => setSection1Count(section1Count + 1)}>+</button>
        <button onClick={() => setSection1Count(Math.max(0, section1Count - 1))}>-</button>
        <p>Count: {section1Count}</p>
      </div>
      <div>
        <h2>Section 2</h2>
        <button onClick={() => setSection2Count(section2Count + 1)}>+</button>
        <button onClick={() => setSection2Count(Math.max(0, section2Count - 1))}>-</button>
        <p>Count: {section2Count}</p>
      </div>
    </div>
  );
};

export default App;
