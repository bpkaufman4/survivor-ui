
import "../assets/bootstrap.min.css"

const adminPages = [
  {
    display: 'Episodes',
    link: 'admin-episodes'
  },
  {
    display: 'Leagues',
    link: 'admin-leagues'
  },
  {
    display: 'Notes',
    link: 'admin-notes'
  },
  {
    display: 'Players',
    link: 'admin-players'
  },
  {
    display: 'Scoring',
    link: 'admin-scoring'
  },
  {
    display: 'Polls',
    link: 'admin-polls'
  },
  {
    display: 'Jobs',
    link: 'admin-jobs'
  },
  {
    display: 'Tribes',
    link: 'admin-tribes'
  }
]

function AdminMain({ nest, page, children }) {
  
  let prefix = '';
  if(!nest) nest = 1;
  
  for(let i = 0; i < nest; i++) {
    prefix += '../';
  }
  
  
  function AdminLink({ display, link }) {
    let classList = "nav-link text-white"

    if(link === page) classList += " active"

    return (
      <li>
        <a href={prefix+link} className={classList}>{display}</a>
      </li>
    )
  }

  return (
    <div style={{display: 'flex'}}>
      <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{width: '280px', height: '100vh'}}>
        <a className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none" href={`${prefix}admin-players`}>
          <span className="fs-4">Survivor</span>
        </a>
        <hr></hr>
        <ul className="nav nav-pills flex-column mb-auto">
          {adminPages.map(({link, display}) => <AdminLink link={link} display={display} key={link}></AdminLink>)}
          <li>
              <a href={prefix} className="nav-link text-white">Back to site</a>
          </li>
        </ul>
      </div>
      <div className="container" style={{width: "calc(100vw 0 280px", height: "100vh", overflowY: "overlay"}}>
        {children}
      </div>
    </div>
  )
}

export default AdminMain;