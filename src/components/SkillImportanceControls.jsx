import React from 'react';
import { Sliders } from 'lucide-react';

const SkillImportanceControls = ({ skillImportance = {}, onImportanceChange }) => {
  // Guard clause to prevent rendering if there are no skills
  if (!skillImportance || Object.keys(skillImportance).length === 0) {
    return null;
  }

  const handleSliderChange = (skill, value) => {
    if (onImportanceChange) {
      onImportanceChange({
        ...skillImportance,
        [skill]: parseFloat(value)
      });
    }
  };

  return (
    <div className="skill-importance-controls p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-5 h-5" />
        <h3 className="font-semibold">Importancia de Habilidades</h3>
      </div>
      
      <div className="grid gap-4">
        {Object.entries(skillImportance).map(([skill, value]) => (
          <div key={skill} className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">{skill}</label>
              <span className="text-sm text-gray-600">
                {(typeof value === 'number' ? value : 1).toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={typeof value === 'number' ? value : 1}
              onChange={(e) => handleSliderChange(skill, e.target.value)}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillImportanceControls;