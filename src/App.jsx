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
      .eq('month', currentMonthDate)
      .single();

    if (error) {
      console.error('Error fetching counts:', error);
    } else if (data) {
      setSection1Count(data.felix || 0);
      setSection2Count(data.anna || 0);
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
  }, []);

  return (
    <div>
      <h1>Monthly Counter</h1>
      <div>
        <h2>F</h2>
        <button onClick={() => handleSection1Count(1)}>+</button>
        <button onClick={() => handleSection1Count(-1)}>-</button>
        <p>Count: {section1Count}</p>
      </div>
      <div>
        <h2>A</h2>
        <button onClick={() => handleSection2Count(1)}>+</button>
        <button onClick={() => handleSection2Count(-1)}>-</button>
        <p>Count: {section2Count}</p>
      </div>
    </div>
  );
};

export default App;
