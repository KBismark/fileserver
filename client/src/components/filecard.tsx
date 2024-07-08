import './filecard.css';

type CardProps = {title: string; img: string; type?: 'image'|'doc', description: string}
export const FileCards = ({ 
    title, type, img,
    description
}: CardProps)=>{

    return (
        <div className="card-container">
            <img src={img} style={{margin: '5%', width: '90%'}} />
            <div className="card-content">
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="card-heading">
                    {/* <div></div> */}
                    <button>Download file</button>
                    <div>
                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 9h-1a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-8a2 2 0 0 0 -2 -2h-1" /><path d="M12 14v-11" /><path d="M9 6l3 -3l3 3" /></svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

