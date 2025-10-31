
import React, { useState } from 'react';
import { LifeEvent } from '../types';

interface LifeEventsFormProps {
    lifeEvents: LifeEvent[];
    setLifeEvents: React.Dispatch<React.SetStateAction<LifeEvent[]>>;
    currentAge: number;
}

const LifeEventsForm: React.FC<LifeEventsFormProps> = ({ lifeEvents, setLifeEvents, currentAge }) => {
    const [eventName, setEventName] = useState('');
    const [eventAge, setEventAge] = useState(currentAge + 5);

    const addEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (eventName.trim() && eventAge > 0) {
            setLifeEvents(prev => [...prev, { id: Date.now().toString(), name: eventName, age: eventAge }]);
            setEventName('');
            setEventAge(currentAge + 5);
        }
    };
    
    const removeEvent = (id: string) => {
        setLifeEvents(prev => prev.filter(event => event.id !== id));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Personal Life Events</h3>
            <p className="text-sm text-gray-600 mb-4">Add future milestones to see them on your mortgage timeline.</p>
            <form onSubmit={addEvent} className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Event Name (e.g., Kid's College)"
                    className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                />
                <input
                    type="number"
                    value={eventAge}
                    onChange={(e) => setEventAge(parseInt(e.target.value))}
                    placeholder="Age"
                    min={currentAge}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                />
                <button type="submit" className="px-4 py-2 bg-brand-secondary text-white rounded-md hover:bg-green-600 transition duration-200 text-sm">Add</button>
            </form>
            <div className="space-y-2">
                {lifeEvents.map(event => (
                    <div key={event.id} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                        <p className="text-sm text-gray-800">{event.name} (at age {event.age})</p>
                        <button onClick={() => removeEvent(event.id)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LifeEventsForm;
