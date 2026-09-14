import Board from './components/Board'
import styles from './App.module.css'

function App() {
  return (
    <main className={styles.app}>
      <h1>Sticky Notes</h1>
      <Board />
    </main>
  )
}

export default App
