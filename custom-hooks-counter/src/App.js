import useLocalStorage from './useLocalStorage';

const App = () => {
  const [name, setName] = useLocalStorage('name', '');

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p>Your name is stored in localStorage: {name}</p>
    </div>
  );
};

export default App;
//
//