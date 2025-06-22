
import {Link} from 'react-router-dom' 
import './index.css'

const Home = () => {
    const hi = 'hloo'

    return(
        <div className="home-container">
            <div className='home-responsive-container'>
                <h1 className="welcome-heading">Welcome to MediCare Companion</h1>
                <p className='home-text'>Your trusted partner in medication management. Choose your role to get started with personalized features.</p>
                <div className='role-container'>
                    <div className='role'>
                        <h1 className='patient'>I'm a Patient</h1>
                        <p className='patient-text'>Track your medication schedule and maintain your health records</p>
                        <ul className='patient-ul'>
                            <li className='p-list'>Mark medications as taken</li>
                            <li className='p-list'>Upload proof photos (optional)</li>
                            <li className='p-list'>View your medication calendar</li>
                            <li className='p-list'>Large, easy-to-use interface</li>
                        </ul>
                        <Link to="signin" className='continue-link'>
                            <button type="click" className='patient-btn'>Continue as Patient</button>
                        </Link>
                    </div>
                    <div className='role'>
                        <h1 className='caretaker'>I'm a Caretaker</h1>
                        <p className='caretaker-text'>Monitor and support your loved one's medication adherence</p>
                        <ul className='caretaker-ul'>
                            <li className='p-list'>Monitor medication compliance</li>
                            <li className='p-list'>Set up notification preferences</li>
                            <li className='p-list'>View detailed reports</li>
                            <li className='p-list'>Receive email alerts</li>
                        </ul>
                        <Link to="signin" className='continue-link'>
                            <button type="button" className='caretaker-btn'>Continue as Caretaker</button>
                        </Link>    
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home