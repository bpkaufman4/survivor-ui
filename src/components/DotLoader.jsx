import '../assets/dot-loader.css'

function DotLoader({ color }) {
  if(!color) color = "";
  return <div className={`dot-loader ${color}`}></div>
}

export default DotLoader