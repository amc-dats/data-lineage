import RiverDiagram from './components/RiverDiagram';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">Product Traceability</h1>
          <p className="app__subtitle">
            Data lineage maturity from raw materials through to shipped / in-field product
          </p>
        </div>
      </header>
      <main className="app__main">
        <RiverDiagram />
      </main>
    </div>
  );
}

export default App;
