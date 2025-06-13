import React, { useState, useRef } from 'react';
import { Download, Grid3X3, Calculator, Settings, Info, Code } from 'lucide-react';
import html2canvas from 'html2canvas';

interface GridSettings {
  maxWidth: number;
  columns: number;
  gutterWidth: number;
  marginWidth: number;
}

const GridCalculator: React.FC = () => {
  const [settings, setSettings] = useState<GridSettings>({
    maxWidth: 1200,
    columns: 12,
    gutterWidth: 20,
    marginWidth: 40,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof GridSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [field]: Math.max(field === 'gutterWidth' || field === 'marginWidth' ? 0 : 1, value)
    }));
  };

  const generateGrid = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowGrid(true);
    }, 300);
  };

  const exportGrid = async () => {
    if (!gridRef.current) return;
    
    try {
      const canvas = await html2canvas(gridRef.current, {
        backgroundColor: '#111827',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `grid-${settings.columns}col-${settings.maxWidth}px.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportCSS = () => {
    const columnWidth = calculateColumnWidth();
    const contentWidth = getContentWidth();
    
    const cssCode = `/* Grid System - ${settings.columns} Column Layout */
.container {
  max-width: ${settings.maxWidth}px;
  margin: 0 auto;
  padding: 0 ${settings.marginWidth}px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -${settings.gutterWidth / 2}px;
}

.col {
  flex: 0 0 auto;
  padding: 0 ${settings.gutterWidth / 2}px;
}

/* Column Width Classes */
${Array.from({ length: settings.columns }, (_, i) => {
  const colNum = i + 1;
  const percentage = ((colNum / settings.columns) * 100).toFixed(4);
  return `.col-${colNum} {
  width: ${percentage}%;
}`;
}).join('\n\n')}

/* Responsive Breakpoints */
@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }
  
  .row {
    margin: 0 -10px;
  }
  
  .col {
    padding: 0 10px;
  }
  
  /* Mobile: Stack columns */
  .col-1, .col-2, .col-3, .col-4, .col-5, .col-6,
  .col-7, .col-8, .col-9, .col-10, .col-11, .col-12 {
    width: 100%;
  }
}

/* Usage Example:
<div class="container">
  <div class="row">
    <div class="col col-6">Half width column</div>
    <div class="col col-6">Half width column</div>
  </div>
  <div class="row">
    <div class="col col-4">One third</div>
    <div class="col col-4">One third</div>
    <div class="col col-4">One third</div>
  </div>
</div>
*/

/* Grid Specifications:
 * Max Width: ${settings.maxWidth}px
 * Content Width: ${contentWidth}px
 * Column Width: ${columnWidth}px
 * Total Columns: ${settings.columns}
 * Gutter Width: ${settings.gutterWidth}px
 * Margin Width: ${settings.marginWidth}px
 */`;

    const blob = new Blob([cssCode], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grid-system-${settings.columns}col-${settings.maxWidth}px.css`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const calculateColumnWidth = () => {
    const totalGutters = (settings.columns - 1) * settings.gutterWidth;
    const totalMargins = settings.marginWidth * 2;
    const contentWidth = settings.maxWidth - totalMargins;
    const availableWidth = contentWidth - totalGutters;
    return Math.floor(availableWidth / settings.columns);
  };

  const getContentWidth = () => {
    return settings.maxWidth - (settings.marginWidth * 2);
  };

  const renderGridColumns = () => {
    const columnWidth = calculateColumnWidth();
    const columns = [];

    for (let i = 0; i < settings.columns; i++) {
      columns.push(
        <div
          key={i}
          className="bg-blue-500/25 border border-blue-400/40 rounded-lg flex items-center justify-center text-blue-300 font-medium transition-all duration-300 hover:bg-blue-500/35 hover:border-blue-400/60"
          style={{
            width: `${columnWidth}px`,
            height: '100px',
            marginRight: i < settings.columns - 1 ? `${settings.gutterWidth}px` : '0',
          }}
        >
          <span className="text-xs font-semibold">Col {i + 1}</span>
        </div>
      );
    }

    return columns;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-600 rounded-xl">
              <Grid3X3 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Grid Calculator
            </h1>
          </div>
          <p className="text-gray-400">
            Generate and preview column-based grid layouts for UI/UX design
          </p>
        </div>

        {/* Controls Panel */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6 shadow-2xl border border-gray-700">
          <div className="flex items-center gap-3 mb-5">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold">Grid Settings</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Max Width (px)
              </label>
              <input
                type="number"
                value={settings.maxWidth}
                onChange={(e) => handleInputChange('maxWidth', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white text-sm"
                min="200"
                max="2000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Number of Columns
              </label>
              <input
                type="number"
                value={settings.columns}
                onChange={(e) => handleInputChange('columns', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white text-sm"
                min="1"
                max="24"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Gutter Width (px)
              </label>
              <input
                type="number"
                value={settings.gutterWidth}
                onChange={(e) => handleInputChange('gutterWidth', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white text-sm"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Margin Width (px)
              </label>
              <input
                type="number"
                value={settings.marginWidth}
                onChange={(e) => handleInputChange('marginWidth', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white text-sm"
                min="0"
                max="200"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={generateGrid}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              <Calculator className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Grid'}
            </button>

            <button
              onClick={exportGrid}
              disabled={!showGrid}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              <Download className="w-4 h-4" />
              Export Grid (PNG)
            </button>

            <button
              onClick={exportCSS}
              disabled={!showGrid}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              <Code className="w-4 h-4" />
              Export CSS
            </button>
          </div>
        </div>

        {/* Grid Specifications */}
        {showGrid && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-6 shadow-2xl border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-400">Grid Specifications</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
              <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
                <div className="text-gray-400 text-xs mb-1">Max Width</div>
                <div className="text-lg font-bold text-white">{settings.maxWidth}px</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
                <div className="text-gray-400 text-xs mb-1">Content Width</div>
                <div className="text-lg font-bold text-green-400">{getContentWidth()}px</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
                <div className="text-gray-400 text-xs mb-1">Column Width</div>
                <div className="text-lg font-bold text-blue-400">{calculateColumnWidth()}px</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
                <div className="text-gray-400 text-xs mb-1">Total Columns</div>
                <div className="text-lg font-bold text-purple-400">{settings.columns}</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
                <div className="text-gray-400 text-xs mb-1">Gutter Width</div>
                <div className="text-lg font-bold text-orange-400">{settings.gutterWidth}px</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Container Simulation - Full Width Fluid Container */}
      {showGrid && (
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-4 text-blue-400 text-center">Container Simulation</h3>
          
          {/* Container Visualization */}
          <div className="w-full">
            {/* Outer Container */}
            <div 
              className="mx-auto border-2 border-dashed border-gray-600 relative"
              style={{ maxWidth: `${settings.maxWidth}px` }}
            >
              {/* Margin Indicators */}
              <div className="absolute -top-6 left-0 text-xs text-gray-500">
                Margin: {settings.marginWidth}px
              </div>
              <div className="absolute -top-6 right-0 text-xs text-gray-500">
                Margin: {settings.marginWidth}px
              </div>
              
              {/* Content Area */}
              <div
                className="border border-gray-600/50 relative"
                style={{
                  marginLeft: `${settings.marginWidth}px`,
                  marginRight: `${settings.marginWidth}px`,
                  padding: '20px 0',
                }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-400 bg-gray-900 px-2 py-1 rounded">
                  Content Width: {getContentWidth()}px
                </div>
                
                {/* Grid Columns */}
                <div 
                  ref={gridRef}
                  className="flex justify-start transition-all duration-500 ease-in-out"
                >
                  {renderGridColumns()}
                </div>
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="max-w-6xl mx-auto mt-6 px-4">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Calculation Formula:</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>• Content Width = Max Width - (Margin × 2) = {settings.maxWidth} - ({settings.marginWidth} × 2) = <span className="text-green-400 font-semibold">{getContentWidth()}px</span></div>
                  <div>• Available Width = Content Width - (Gutters × {settings.columns - 1}) = {getContentWidth()} - ({settings.gutterWidth} × {settings.columns - 1}) = {getContentWidth() - (settings.gutterWidth * (settings.columns - 1))}px</div>
                  <div>• Column Width = Available Width ÷ {settings.columns} = <span className="text-blue-400 font-semibold">{calculateColumnWidth()}px</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        <p>Built for designers who care about precision and beauty</p>
      </div>
    </div>
  );
};

export default GridCalculator;
