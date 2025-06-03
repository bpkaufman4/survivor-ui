import "../assets/bootstrap.min.css"

const Layout = ({ nest, children }) => {
  let prefix = '';

  if(!nest) nest = 1;
  
  for(let i = 0; i < nest; i++) {
    prefix += '../'
  }
  return (
    <>
      <main className="container" style={{height: 'calc(100vh - 40px)'}}>{children}</main>
    </>
  )
}

export default Layout