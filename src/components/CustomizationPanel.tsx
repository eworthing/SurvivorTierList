import React, { useState } from 'react';
import type { TierConfig, TierConfigEntry } from '../types';

interface CustomizationPanelProps {
  tierConfig: TierConfig;
  onTierConfigChange: (newConfig: TierConfig) => void;
  onClose: () => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  tierConfig,
  onTierConfigChange,
  onClose
}) => {
  const [localConfig, setLocalConfig] = useState<TierConfig>(
    JSON.parse(JSON.stringify(tierConfig))
  );

  const handleTierChange = (tierKey: string, field: keyof TierConfigEntry, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      [tierKey]: {
        ...prev[tierKey],
        [field]: value
      }
    }));
  };

  const handleColorChange = (tierKey: string, hexColor: string) => {
    setLocalConfig(prev => ({
      ...prev,
      [tierKey]: {
        ...prev[tierKey],
        hexColor,
        color: `from-[${hexColor}] to-[${hexColor}dd]` // Add slight transparency to the "to" color
      }
    }));
  };

  const addTier = () => {
    const newTierName = `Tier ${Object.keys(localConfig).length + 1}`;
    const newTierKey = `tier_${Object.keys(localConfig).length + 1}`;
    
    setLocalConfig(prev => ({
      ...prev,
      [newTierKey]: {
        name: newTierName,
        color: 'from-gray-400 to-gray-500',
        hexColor: '#9ca3af',
        description: 'Custom Tier'
      }
    }));
  };

  const removeTier = (tierKey: string) => {
    const tierCount = Object.keys(localConfig).length;
    
    if (tierCount <= 2) {
      alert('You must have at least two tiers.');
      return;
    }
    
    setLocalConfig(prev => {
      const newConfig = { ...prev };
      delete newConfig[tierKey];
      return newConfig;
    });
  };

  const handleSave = () => {
    onTierConfigChange(localConfig);
    onClose();
  };

  const resetToDefaults = () => {
    const defaultConfig: TierConfig = {
      S: { name: 'S', color: 'from-red-500 to-red-600', hexColor: '#ef4444', description: 'Legendary' },
      A: { name: 'A', color: 'from-orange-400 to-orange-500', hexColor: '#fb923c', description: 'Excellent' },
      B: { name: 'B', color: 'from-yellow-400 to-yellow-500', hexColor: '#facc15', description: 'Great' },
      C: { name: 'C', color: 'from-green-400 to-green-500', hexColor: '#4ade80', description: 'Good' },
      D: { name: 'D', color: 'from-teal-400 to-teal-500', hexColor: '#2dd4bf', description: 'Average' },
      F: { name: 'F', color: 'from-gray-500 to-gray-600', hexColor: '#6b7280', description: 'Underwhelming' }
    };
    setLocalConfig(defaultConfig);
  };

  return (
    <div className="text-white">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Customize Your Tier System</h3>
        <p className="text-slate-400 text-sm">
          Modify tier names, descriptions, and colors. Changes will apply to your current ranking.
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(localConfig).map(([tierKey, tier]) => (
          <div 
            key={tierKey} 
            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center p-4 bg-slate-700 rounded-lg"
          >
            <div>
              <label htmlFor={`name-${tierKey}`} className="block text-xs text-slate-300 mb-1">
                Tier Name
              </label>
              <input
                id={`name-${tierKey}`}
                type="text"
                value={tier.name}
                onChange={e => handleTierChange(tierKey, 'name', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white
                          focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Tier name"
                maxLength={10}
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor={`desc-${tierKey}`} className="block text-xs text-slate-300 mb-1">
                Description
              </label>
              <input
                id={`desc-${tierKey}`}
                type="text"
                value={tier.description || ''}
                onChange={e => handleTierChange(tierKey, 'description', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white
                          focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Description"
                maxLength={50}
              />
            </div>
            
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor={`color-${tierKey}`} className="block text-xs text-slate-300 mb-1">
                  Color
                </label>
                <input
                  id={`color-${tierKey}`}
                  type="color"
                  value={tier.hexColor || '#6b7280'}
                  onChange={e => handleColorChange(tierKey, e.target.value)}
                  className="w-full h-10 rounded border border-slate-600 bg-transparent cursor-pointer"
                  title="Choose tier color"
                />
              </div>
              
              <button
                onClick={() => removeTier(tierKey)}
                className="h-10 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded 
                          transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Remove tier"
                aria-label={`Remove ${tier.name} tier`}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={addTier}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded 
                      transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            + Add Tier
          </button>
          
          <button
            onClick={resetToDefaults}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded 
                      transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset to Defaults
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded 
                      transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded 
                      transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-700 rounded text-sm text-slate-300">
        <strong>💡 Tip:</strong> You can create up to 10 custom tiers. Colors will be applied as gradients 
        throughout the interface for better visual distinction.
      </div>
    </div>
  );
};

export default CustomizationPanel;
