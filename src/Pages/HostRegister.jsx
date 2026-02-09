import { useState } from "react";
import { Link } from "react-router-dom";

export default function HostRegister() {
    const activityOptions = ["Nature & outdoors", "City tours", "Culture", "Wellness", "Food & Drink", "Sports"];
    const [selectedActivities, setSelectedActivities] = useState([]);

    const handleActivityChange = (e) => {
        const val = e.target.value;
        if (val && !selectedActivities.includes(val)) {
            setSelectedActivities([...selectedActivities, val]);
        }
        e.target.value = "";
    };

    const removeActivity = (activity) => {
        setSelectedActivities(selectedActivities.filter(a => a !== activity));
    };

    return (
        <section className="host-page">
            <Link to="/" className="back-link">← Back to homepage</Link>

            <h1>Become a Finnamie Host</h1>
            <p className="subtitle">Start sharing authentic experiences with travelers by becoming a host.</p>

            <form className="host-form">
                <h2><span className="required">Basic information</span></h2>

                <label>
                    <span className="required">Full name</span>
                    <input type="text" required />
                </label>

                <label>
                    <span className="required">Email</span>
                    <input type="email" required />
                </label>

                <label>
                    <span className="required">Phone number</span>
                    <input type="tel" required />
                </label>

                <div className="address-grid">
                    <label>
                        <span className="required">Street Address</span>
                        <input type="text" required />
                    </label>
                    <label>
                        <span className="required">Postal Code</span>
                        <input type="text" required />
                    </label>
                </div>

                <div className="address-grid">
                    <label>
                        <span className="required">City</span>
                        <input type="text" required />
                    </label>
                    <label>
                        <span className="required">Country</span>
                        <input type="text" required />
                    </label>
                </div>

                <label>
                    <span className="required">Date of birth</span>
                    <input type="date" required />
                </label>

                <h2><span className="required">Activities you offer</span></h2>
                <p className="field-description">Select the types of activities you can provide to travelers.</p>

                <select onChange={handleActivityChange}>
                    <option value="">-- Choose an activity --</option>
                    {activityOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>

                {selectedActivities.length > 0 && (
                    <div className="selected-tags">
                        {selectedActivities.map(act => (
                            <span key={act} className="tag">
                                {act}
                                <button type="button" onClick={() => removeActivity(act)}>×</button>
                            </span>
                        ))}
                    </div>
                )}

                <h2><span className="required">Experience length</span></h2>
                <p className="field-description">Are you primarily able to offer half-day or full-day activities?</p>

                <div className="checkbox-group">
                    <label>
                        <input type="checkbox" /> Half-day
                    </label>
                    <label>
                        <input type="checkbox" /> Full-day
                    </label>
                </div>

                <h2>Tell us about yourself (Optional)</h2>
                <p className="field-description">Is there anything else you'd like us to know? Feel free to share your hobbies or what else you have to offer.</p>
                <textarea rows="5" placeholder="Tell us about yourself..." />

                <button type="submit">Send application</button>
            </form>
        </section>
    );
}