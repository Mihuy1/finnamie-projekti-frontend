import { Link } from "react-router-dom";

export default function HostRegister() {
    return (
        <section className="host-page">

            <Link to="/" className="back-link">← Back to homepage</Link>

            <h1>Become a Finnamie Host</h1>

            <form className="host-form">
                <h2 className="required">Basic information</h2>

                <label className="required">
                    Full name
                    <input type="text" required />
                </label>

                <label className="required">
                    Email
                    <input type="email" required />
                </label>

                <label className="required">
                    City / Location
                    <input type="text" required />
                </label>

                <label className="required">
                    Date of birth
                    <input type="date" required />
                </label>


                <h2 className="required">Activities you offer</h2>
                <label><input type="checkbox" /> Nature & outdoors</label>
                <label><input type="checkbox" /> City tours</label>
                <label><input type="checkbox" /> Culture</label>
                <label><input type="checkbox" /> Wellness</label>

                <h2 className="required">Experience length</h2>
                <label><input type="checkbox" /> Half-day</label>
                <label><input type="checkbox" /> Full-day</label>

                <textarea required placeholder="Tell us about yourself..." rows="5" />

                <button type="submit">Send application</button>
            </form>
        </section>
    );
}
