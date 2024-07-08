
import './header.css'

type Props = {email: string}
export const Header = ({email}: Props)=>{
    email = (email.length>20? `${email.slice(0,20)}...`: email).toLowerCase()
    return (
        <header className="header">
            <div style={{fontWeight: 500,}}>Hi, {email}</div>
            <div>
                <button>Logout</button>
            </div>
        </header>
    )
}
