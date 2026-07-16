import { useState } from 'react';
import type { Settings } from '../../hooks/useSettings';
import { open } from '@tauri-apps/plugin-dialog';

interface SettingsPanelProps {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onClose: () => void;
}

type SettingsTab = 'editor' | 'theme' | 'file' | 'preview' | 'shortcuts' | 'advanced';

const FONT_FAMILIES = [
  { label: 'Cascadia Code', value: "'Cascadia Code', monospace" },
  { label: 'Fira Code', value: "'Fira Code', monospace" },
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { label: 'Consolas', value: "Consolas, monospace" },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Source Code Pro', value: "'Source Code Pro', monospace" },
  { label: 'Ubuntu Mono', value: "'Ubuntu Mono', monospace" },
];

const ENCODINGS = ['UTF-8', 'UTF-16 LE', 'UTF-16 BE', 'ASCII', 'ISO-8859-1', 'GBK'];

const EDITOR_THEMES = [
  { 
    label: '默认', 
    value: 'default',
    colors: { bg: '#ffffff', fg: '#1e1e1e', keyword: '#0000ff', string: '#a31515', comment: '#008000', line: '#f5f5f5' }
  },
  { 
    label: 'One Dark Pro', 
    value: 'one-dark-pro',
    colors: { bg: '#282c34', fg: '#abb2bf', keyword: '#c678dd', string: '#98c379', comment: '#5c6370', line: '#2c313c' }
  },
  { 
    label: 'Solarized Light', 
    value: 'solarized-light',
    colors: { bg: '#fdf6e3', fg: '#657b83', keyword: '#859900', string: '#2aa198', comment: '#93a1a1', line: '#eee8d5' }
  },
  { 
    label: 'Dracula', 
    value: 'dracula',
    colors: { bg: '#282a36', fg: '#f8f8f2', keyword: '#ff79c6', string: '#f1fa8c', comment: '#6272a4', line: '#343746' }
  },
  { 
    label: 'Monokai', 
    value: 'monokai',
    colors: { bg: '#272822', fg: '#f8f8f2', keyword: '#f92672', string: '#e6db74', comment: '#75715e', line: '#3e3d32' }
  },
  { 
    label: 'Solarized', 
    value: 'solarized',
    colors: { bg: '#002b36', fg: '#839496', keyword: '#859900', string: '#2aa198', comment: '#586e75', line: '#073642' }
  },
];

const CURSOR_BLINKING = [
  { label: '闪烁', value: 'blink' },
  { label: '平滑', value: 'smooth' },
  { label: '渐变', value: 'phase' },
  { label: '展开', value: 'expand' },
  { label: '实心', value: 'solid' },
];

const CURSOR_STYLES = [
  { label: '竖线', value: 'line' },
  { label: '方块', value: 'block' },
  { label: '下划线', value: 'underline' },
];

export function SettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('editor');

  // 选择文件夹
  const handleSelectFolder = async (key: 'defaultSavePath' | 'defaultExportPath') => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (selected) {
        onUpdate(key, selected as string);
      }
    } catch (err) {
      console.error('Failed to select folder:', err);
    }
  };

  // 重置当前分类的设置
  const resetCategory = (category: string) => {
    if (!confirm(`确定要重置${category}的所有设置吗？`)) return;
    
    switch (activeTab) {
      case 'editor':
        onUpdate('fontSize', 14);
        onUpdate('fontFamily', "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace");
        onUpdate('tabSize', 2);
        onUpdate('wordWrap', 'on');
        onUpdate('showLineNumbers', true);
        onUpdate('highlightActiveLine', true);
        onUpdate('bracketMatching', true);
        onUpdate('autoCloseBrackets', true);
        onUpdate('lineWrapping', true);
        onUpdate('smoothScrolling', true);
        onUpdate('cursorBlinking', 'blink');
        onUpdate('cursorStyle', 'line');
        break;
      case 'theme':
        onUpdate('theme', 'system');
        onUpdate('editorTheme', 'default');
        break;
      case 'file':
        onUpdate('defaultSavePath', '');
        onUpdate('defaultExportPath', '');
        onUpdate('autoSave', true);
        onUpdate('autoSaveDelay', 1000);
        onUpdate('encoding', 'UTF-8');
        onUpdate('lineEnding', 'LF');
        break;
      case 'preview':
        onUpdate('showPreview', true);
        onUpdate('syncScroll', true);
        onUpdate('previewTheme', 'auto');
        break;
    }
  };

  const tabs = [
    { id: 'editor' as SettingsTab, label: '编辑器', icon: '📝' },
    { id: 'theme' as SettingsTab, label: '主题', icon: '🎨' },
    { id: 'file' as SettingsTab, label: '文件', icon: '📁' },
    { id: 'preview' as SettingsTab, label: '预览', icon: '👁️' },
    { id: 'advanced' as SettingsTab, label: '高级', icon: '⚙️' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div
        className="rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* 侧边栏 */}
        <div
          className="w-48 border-r p-4 flex flex-col"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-sidebar)' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            ⚙️ 设置
          </h2>
          <nav className="flex-1 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--accent-color)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-primary)',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          <button
            onClick={onClose}
            className="mt-4 w-full px-3 py-2 rounded text-sm hover:bg-black/10 dark:hover:bg-white/10"
            style={{ color: 'var(--text-primary)' }}
          >
            关闭
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* 编辑器设置 */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  编辑器设置
                </h3>
                <button
                  onClick={() => resetCategory('编辑器')}
                  className="text-xs px-2 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  重置默认
                </button>
              </div>

              {/* 字体大小 */}
              <SettingItem label="字体大小" description="编辑器文字大小">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={settings.fontSize}
                    onChange={(e) => onUpdate('fontSize', Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right" style={{ color: 'var(--text-secondary)' }}>
                    {settings.fontSize}px
                  </span>
                </div>
              </SettingItem>

              {/* 字体族 */}
              <SettingItem label="字体" description="编辑器字体">
                <select
                  value={settings.fontFamily}
                  onChange={(e) => onUpdate('fontFamily', e.target.value)}
                  className="w-full p-2 rounded border text-sm"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </SettingItem>

              {/* 字体预览区域 */}
              <div 
                className="p-4 rounded-lg border"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                <div className="text-xs mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  实时预览
                </div>
                <div 
                  className="p-3 rounded"
                  style={{
                    fontFamily: settings.fontFamily,
                    fontSize: `${settings.fontSize}px`,
                    backgroundColor: 'var(--bg-sidebar)',
                    border: '1px solid var(--border-color)',
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ color: 'var(--text-primary)' }}>
                    <span style={{ color: '#0000ff' }}>const</span>{' '}
                    <span style={{ color: '#001080' }}>greeting</span> ={' '}
                    <span style={{ color: '#a31515' }}>"Hello, World!"</span>;
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span style={{ color: '#008000' }}>// 字体预览 - 当前大小: {settings.fontSize}px</span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', marginTop: '4px' }}>
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    abcdefghijklmnopqrstuvwxyz 0123456789
                  </div>
                </div>
              </div>

              {/* Tab 大小 */}
              <SettingItem label="Tab 大小" description="按下 Tab 键插入的空格数">
                <select
                  value={settings.tabSize}
                  onChange={(e) => onUpdate('tabSize', Number(e.target.value))}
                  className="w-full p-2 rounded border text-sm"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value={2}>2 空格</option>
                  <option value={4}>4 空格</option>
                  <option value={8}>8 空格</option>
                </select>
              </SettingItem>

              {/* 自动换行 */}
              <SettingItem label="自动换行" description="长行自动换行显示">
                <ToggleSwitch
                  checked={settings.wordWrap === 'on'}
                  onChange={(checked) => onUpdate('wordWrap', checked ? 'on' : 'off')}
                />
              </SettingItem>

              {/* 显示行号 */}
              <SettingItem label="行号" description="在编辑器左侧显示行号">
                <ToggleSwitch
                  checked={settings.showLineNumbers}
                  onChange={(checked) => onUpdate('showLineNumbers', checked)}
                />
              </SettingItem>

              {/* 高亮当前行 */}
              <SettingItem label="高亮当前行" description="高亮显示光标所在行">
                <ToggleSwitch
                  checked={settings.highlightActiveLine}
                  onChange={(checked) => onUpdate('highlightActiveLine', checked)}
                />
              </SettingItem>

              {/* 括号匹配 */}
              <SettingItem label="括号匹配" description="高亮显示匹配的括号">
                <ToggleSwitch
                  checked={settings.bracketMatching}
                  onChange={(checked) => onUpdate('bracketMatching', checked)}
                />
              </SettingItem>

              {/* 自动关闭括号 */}
              <SettingItem label="自动关闭括号" description="输入左括号时自动补全右括号">
                <ToggleSwitch
                  checked={settings.autoCloseBrackets}
                  onChange={(checked) => onUpdate('autoCloseBrackets', checked)}
                />
              </SettingItem>

              {/* 光标样式 */}
              <SettingItem label="光标样式" description="光标的显示样式">
                <div className="flex gap-2">
                  {CURSOR_STYLES.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => onUpdate('cursorStyle', style.value as any)}
                      className={`px-3 py-1.5 rounded text-sm ${
                        settings.cursorStyle === style.value ? 'font-medium' : ''
                      }`}
                      style={{
                        backgroundColor: settings.cursorStyle === style.value ? 'var(--accent-color)' : 'var(--bg-primary)',
                        color: settings.cursorStyle === style.value ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </SettingItem>

              {/* 光标闪烁 */}
              <SettingItem label="光标闪烁" description="光标的闪烁动画">
                <select
                  value={settings.cursorBlinking}
                  onChange={(e) => onUpdate('cursorBlinking', e.target.value as any)}
                  className="w-full p-2 rounded border text-sm"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {CURSOR_BLINKING.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </SettingItem>

              {/* 平滑滚动 */}
              <SettingItem label="平滑滚动" description="启用平滑滚动动画">
                <ToggleSwitch
                  checked={settings.smoothScrolling}
                  onChange={(checked) => onUpdate('smoothScrolling', checked)}
                />
              </SettingItem>
            </div>
          )}

          {/* 主题设置 */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  主题设置
                </h3>
                <button
                  onClick={() => resetCategory('主题')}
                  className="text-xs px-2 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  重置默认
                </button>
              </div>

              {/* 应用主题 */}
              <SettingItem label="应用主题" description="选择应用的整体主题">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: '亮色', icon: '☀️' },
                    { value: 'dark', label: '暗色', icon: '🌙' },
                    { value: 'system', label: '跟随系统', icon: '💻' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => onUpdate('theme', item.value as any)}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        settings.theme === item.value ? 'ring-2' : ''
                      }`}
                      style={{
                        borderColor: settings.theme === item.value ? 'var(--accent-color)' : 'var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',

                      }}
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-sm">{item.label}</div>
                    </button>
                  ))}
                </div>
              </SettingItem>

              {/* 编辑器主题 */}
              <SettingItem label="编辑器主题" description="代码编辑器的颜色主题">
                <div className="grid grid-cols-2 gap-3">
                  {EDITOR_THEMES.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => onUpdate('editorTheme', theme.value as any)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        settings.editorTheme === theme.value ? 'ring-2' : ''
                      }`}
                      style={{
                        borderColor: settings.editorTheme === theme.value ? 'var(--accent-color)' : 'var(--border-color)',
                        backgroundColor: theme.colors.bg,
                        color: theme.colors.fg,
                      }}
                    >
                      {/* 颜色预览方块 */}
                      <div className="flex gap-1 mb-2">
                        <div 
                          className="w-4 h-4 rounded-sm" 
                          style={{ backgroundColor: theme.colors.keyword }}
                          title="关键字"
                        />
                        <div 
                          className="w-4 h-4 rounded-sm" 
                          style={{ backgroundColor: theme.colors.string }}
                          title="字符串"
                        />
                        <div 
                          className="w-4 h-4 rounded-sm" 
                          style={{ backgroundColor: theme.colors.comment }}
                          title="注释"
                        />
                        <div 
                          className="w-4 h-4 rounded-sm" 
                          style={{ backgroundColor: theme.colors.fg }}
                          title="文字"
                        />
                      </div>
                      <div className="text-sm font-medium">{theme.label}</div>
                      {/* 代码预览 */}
                      <div 
                        className="mt-2 p-2 rounded text-xs"
                        style={{ 
                          backgroundColor: theme.colors.line,
                          fontFamily: settings.fontFamily,
                        }}
                      >
                        <div>
                          <span style={{ color: theme.colors.keyword }}>const</span>{' '}
                          <span style={{ color: theme.colors.fg }}>x</span> ={' '}
                          <span style={{ color: theme.colors.string }}>"hi"</span>;
                        </div>
                        <div style={{ color: theme.colors.comment }}>// comment</div>
                      </div>
                    </button>
                  ))}
                </div>
              </SettingItem>
            </div>
          )}

          {/* 文件设置 */}
          {activeTab === 'file' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  文件设置
                </h3>
                <button
                  onClick={() => resetCategory('文件')}
                  className="text-xs px-2 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  重置默认
                </button>
              </div>

              {/* 默认保存路径 */}
              <SettingItem label="默认保存路径" description="新建文件时的默认保存位置">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.defaultSavePath}
                    onChange={(e) => onUpdate('defaultSavePath', e.target.value)}
                    placeholder="留空使用系统默认"
                    className="flex-1 p-2 rounded border text-sm"
                    style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={() => handleSelectFolder('defaultSavePath')}
                    className="px-3 py-2 rounded text-sm"
                    style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
                  >
                    浏览
                  </button>
                </div>
              </SettingItem>

              {/* 默认导出路径 */}
              <SettingItem label="默认导出路径" description="导出 PDF/图片时的默认保存位置">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.defaultExportPath}
                    onChange={(e) => onUpdate('defaultExportPath', e.target.value)}
                    placeholder="留空使用系统默认"
                    className="flex-1 p-2 rounded border text-sm"
                    style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={() => handleSelectFolder('defaultExportPath')}
                    className="px-3 py-2 rounded text-sm"
                    style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
                  >
                    浏览
                  </button>
                </div>
              </SettingItem>

              {/* 自动保存 */}
              <SettingItem label="自动保存" description="自动保存文件到磁盘">
                <ToggleSwitch
                  checked={settings.autoSave}
                  onChange={(checked) => onUpdate('autoSave', checked)}
                />
              </SettingItem>

              {/* 自动保存延迟 */}
              {settings.autoSave && (
                <SettingItem label="自动保存延迟" description="内容变化后多久自动保存（毫秒）">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="500"
                      max="5000"
                      step="100"
                      value={settings.autoSaveDelay}
                      onChange={(e) => onUpdate('autoSaveDelay', Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm w-16 text-right" style={{ color: 'var(--text-secondary)' }}>
                      {settings.autoSaveDelay}ms
                    </span>
                  </div>
                </SettingItem>
              )}

              {/* 文件编码 */}
              <SettingItem label="文件编码" description="默认文件编码格式">
                <select
                  value={settings.encoding}
                  onChange={(e) => onUpdate('encoding', e.target.value)}
                  className="w-full p-2 rounded border text-sm"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {ENCODINGS.map((enc) => (
                    <option key={enc} value={enc}>
                      {enc}
                    </option>
                  ))}
                </select>
              </SettingItem>

              {/* 换行符 */}
              <SettingItem label="换行符" description="文件使用的换行符类型">
                <div className="flex gap-2">
                  {[
                    { value: 'LF', label: 'LF (Unix/macOS)' },
                    { value: 'CRLF', label: 'CRLF (Windows)' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => onUpdate('lineEnding', item.value as any)}
                      className={`flex-1 px-3 py-2 rounded text-sm ${
                        settings.lineEnding === item.value ? 'font-medium' : ''
                      }`}
                      style={{
                        backgroundColor: settings.lineEnding === item.value ? 'var(--accent-color)' : 'var(--bg-primary)',
                        color: settings.lineEnding === item.value ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </SettingItem>
            </div>
          )}

          {/* 预览设置 */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  预览设置
                </h3>
                <button
                  onClick={() => resetCategory('预览')}
                  className="text-xs px-2 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  重置默认
                </button>
              </div>

              {/* 默认显示预览 */}
              <SettingItem label="默认显示预览" description="打开文件时自动显示预览面板">
                <ToggleSwitch
                  checked={settings.showPreview}
                  onChange={(checked) => onUpdate('showPreview', checked)}
                />
              </SettingItem>

              {/* 同步滚动 */}
              <SettingItem label="同步滚动" description="编辑器和预览面板同步滚动">
                <ToggleSwitch
                  checked={settings.syncScroll}
                  onChange={(checked) => onUpdate('syncScroll', checked)}
                />
              </SettingItem>

              {/* 预览主题 */}
              <SettingItem label="预览主题" description="预览面板的主题">
                <div className="flex gap-2">
                  {[
                    { value: 'light', label: '亮色' },
                    { value: 'dark', label: '暗色' },
                    { value: 'auto', label: '跟随主题' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => onUpdate('previewTheme', item.value as any)}
                      className={`flex-1 px-3 py-2 rounded text-sm ${
                        settings.previewTheme === item.value ? 'font-medium' : ''
                      }`}
                      style={{
                        backgroundColor: settings.previewTheme === item.value ? 'var(--accent-color)' : 'var(--bg-primary)',
                        color: settings.previewTheme === item.value ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </SettingItem>
            </div>
          )}

          {/* 高级设置 */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                高级设置
              </h3>

              {/* 硬件加速 */}
              <SettingItem label="硬件加速" description="使用 GPU 加速渲染（重启后生效）">
                <ToggleSwitch
                  checked={settings.hardwareAcceleration}
                  onChange={(checked) => onUpdate('hardwareAcceleration', checked)}
                />
              </SettingItem>

              {/* 重置所有设置 */}
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={() => {
                    if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 rounded text-sm"
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  重置所有设置
                </button>
                <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                  重置后应用将重新加载
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 设置项组件
function SettingItem({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex-1">
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </div>
        {description && (
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 w-48">{children}</div>
    </div>
  );
}

// 开关组件
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
      style={{
        backgroundColor: checked ? 'var(--accent-color)' : 'var(--border-color)',
      }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}