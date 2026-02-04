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
      [field]: Math.max(field === 'gutterWidth' || field === 'marginWidth' ? 0 : 1, value),
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
    return settings.maxWidth - settings.marginWidth * 2;
  };

  const renderGridColumns = () => {
    const columnWidth = calculateColumnWidth();
    const columns = [];

    for (let i = 0; i < settings.columns; i++) {
      columns.push(
        <div
          key={i}
          className="flex items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-sm transition-colors duration-200 hover:bg-primary/20"
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
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="rounded-xl border border-border bg-card p-2.5 shadow-sm">
              <Grid3X3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Grid Calculator</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate and preview column-based grid layouts for UI/UX design.
          </p>
        </div>

        {/* Controls Panel */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Grid Settings</h2>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Max Width (px)</label>
              <input
                type="number"
                value={settings.maxWidth}
                onChange={e => handleInputChange('maxWidth', parseInt(e.target.value) || 0)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                min="200"
                max="2000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Number of Columns
              </label>
              <input
                type="number"
                value={settings.columns}
                onChange={e => handleInputChange('columns', parseInt(e.target.value) || 0)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                min="1"
                max="24"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Gutter Width (px)
              </label>
              <input
                type="number"
                value={settings.gutterWidth}
                onChange={e => handleInputChange('gutterWidth', parseInt(e.target.value) || 0)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Margin Width (px)
              </label>
              <input
                type="number"
                value={settings.marginWidth}
                onChange={e => handleInputChange('marginWidth', parseInt(e.target.value) || 0)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                min="0"
                max="200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={generateGrid}
              disabled={isGenerating}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              <Calculator className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Grid'}
            </button>

            <button
              onClick={exportGrid}
              disabled={!showGrid}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-sm transition hover:bg-secondary/80 disabled:pointer-events-none disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export Grid (PNG)
            </button>

            <button
              onClick={exportCSS}
              disabled={!showGrid}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <Code className="h-4 w-4" />
              Export CSS
            </button>
          </div>
        </div>

        {/* Grid Specifications */}
        {showGrid && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Grid Specifications</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">Max Width</div>
                <div className="text-lg font-bold text-foreground">{settings.maxWidth}px</div>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">Content Width</div>
                <div className="text-lg font-bold text-emerald-400">{getContentWidth()}px</div>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">Column Width</div>
                <div className="text-lg font-bold text-primary">{calculateColumnWidth()}px</div>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">Total Columns</div>
                <div className="text-lg font-bold text-violet-400">{settings.columns}</div>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">Gutter Width</div>
                <div className="text-lg font-bold text-amber-400">{settings.gutterWidth}px</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Container Simulation - Full Width Fluid Container */}
      {showGrid && (
        <div className="w-full pb-8">
          <h3 className="mb-4 text-center text-lg font-semibold text-primary">Container Simulation</h3>

          {/* Container Visualization */}
          <div className="w-full">
            {/* Outer Container */}
            <div
              className="relative mx-auto rounded-2xl border border-dashed border-border bg-card/30 p-6 shadow-sm"
              style={{ maxWidth: `${settings.maxWidth}px` }}
            >
              {/* Margin Indicators */}
              <div className="absolute -top-6 left-0 text-xs text-muted-foreground">
                Margin: {settings.marginWidth}px
              </div>
              <div className="absolute -top-6 right-0 text-xs text-muted-foreground">
                Margin: {settings.marginWidth}px
              </div>

              {/* Content Area */}
              <div
                className="relative rounded-xl border border-border/60 bg-background/50 px-4 py-5"
                style={{
                  marginLeft: `${settings.marginWidth}px`,
                  marginRight: `${settings.marginWidth}px`,
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-md border border-border bg-background px-2 py-1 text-xs text-emerald-400 shadow-sm">
                  Content Width: {getContentWidth()}px
                </div>

                {/* Grid Columns */}
                <div ref={gridRef} className="flex justify-start transition-all duration-500 ease-in-out">
                  {renderGridColumns()}
                </div>
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="mx-auto mt-6 max-w-6xl px-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <h4 className="mb-2 text-sm font-semibold text-foreground">Calculation Formula:</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>
                    • Content Width = Max Width - (Margin × 2) = {settings.maxWidth} - ({settings.marginWidth} ×
                    2) = <span className="font-semibold text-emerald-400">{getContentWidth()}px</span>
                  </div>
                  <div>
                    • Available Width = Content Width - (Gutters × {settings.columns - 1}) = {getContentWidth()} -
                    ({settings.gutterWidth} × {settings.columns - 1}) ={' '}
                    {getContentWidth() - settings.gutterWidth * (settings.columns - 1)}px
                  </div>
                  <div>
                    • Column Width = Available Width ÷ {settings.columns} ={' '}
                    <span className="font-semibold text-primary">{calculateColumnWidth()}px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pb-8 text-center text-sm text-muted-foreground">
        <p>Built for designers who care about precision and beauty</p>
      </div>
    </div>
  );
};

export default GridCalculator;
