
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types ---
type View = 'updates' | 'article' | 'editor' | 'updateEditor' | 'trash' | 'analytics' | 'scheduled' | 'versionHistory';
type UpdateType = 'Новый функционал' | 'Улучшения' | 'Исправлено';
type ModalType = 'none' | 'addTopic' | 'addTag';

interface KBArticle {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  content: string;
  publishedAt: string;
  tags: string[];
  versions: string[]; 
  helpfulCount: number;
  unhelpfulCount: number;
}

interface UpdateEntry {
  id: string;
  date: string;
  publishedAt: string;
  title: string;
  description: string;
  emoji: string;
  type: UpdateType;
  likes: number; 
}

type TrashItem = 
  | { type: 'article'; data: KBArticle }
  | { type: 'update'; data: UpdateEntry };

// --- Icons ---
const Icons = {
  Folder: ({ open }: { open?: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: open ? '#69C' : '#999' }}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      {open && <line x1="12" y1="11" x2="12" y2="17" stroke="#69C" />}
    </svg>
  ),
  Article: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#BBB' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#999' }}>
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Image: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
  Video: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
  Link: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ pointerEvents: 'none' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  History: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline><line x1="12" y1="7" x2="12" y2="12"></line><line x1="12" y1="12" x2="16" y2="14"></line></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Analytics: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  Palette: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M8 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path>
      <path d="M12 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path>
      <path d="M16 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path>
    </svg>
  ),
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>,
  Stars: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
};

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  sidebar: { width: '280px', backgroundColor: '#FFFFFF', borderRight: '1px solid #DDD', padding: '0', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', zIndex: 10 },
  adminBar: { padding: '15px', backgroundColor: '#F5F5F5', borderBottom: '1px solid #DDD', marginBottom: '10px' },
  navItem: { padding: '10px 20px', cursor: 'pointer', color: '#333', fontSize: '15px', fontWeight: 500, transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '12px', userSelect: 'none' },
  navItemActive: { backgroundColor: '#F0F7FF', color: '#69C' },
  subItem: { padding: '8px 20px 8px 52px', cursor: 'pointer', color: '#666', fontSize: '14px', fontWeight: 400, transition: 'all 0.2s', borderLeft: '3px solid transparent', display: 'flex', alignItems: 'center', gap: '8px' },
  subItemActive: { backgroundColor: '#F9F9F9', color: '#69C', borderLeftColor: '#69C' },
  mainContent: { flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative' },
  container: { backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '6px', border: '1px solid #DDD', marginBottom: '20px', position: 'relative' },
  h1: { fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '15px', marginTop: 0 },
  button: { backgroundColor: '#69C', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
  buttonSecondary: { backgroundColor: '#EAEAEA', color: '#333', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
  buttonDanger: { backgroundColor: '#FEE2E2', color: '#EF4444', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
  wordToolbar: { display: 'flex', gap: '6px', backgroundColor: '#F8F9FA', border: '1px solid #DDD', borderBottom: 'none', borderRadius: '6px 6px 0 0', padding: '8px', flexWrap: 'wrap', alignItems: 'center' },
  visualEditor: { width: '100%', minHeight: '400px', padding: '20px', border: '1px solid #DDD', borderRadius: '0 0 6px 6px', fontSize: '15px', fontFamily: 'Roboto, sans-serif', outline: 'none', lineHeight: 1.6, backgroundColor: '#FFF' },
  tag: { fontSize: '12px', backgroundColor: '#EAEAEA', color: '#666', padding: '2px 8px', borderRadius: '12px', marginRight: '6px' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #DDD', marginBottom: '10px', fontSize: '14px', outline: 'none' },
  sidebarSearchContainer: { position: 'relative', margin: '10px 15px', marginBottom: '15px' },
  sidebarSearchInput: { width: '100%', padding: '10px 12px 10px 35px', borderRadius: '6px', border: '1px solid #DDD', fontSize: '14px', outline: 'none', backgroundColor: '#FAFAFA' },
  badge: { fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto', fontWeight: 'bold' },
  timelineLine: { position: 'absolute', left: '50%', top: '100px', bottom: 0, width: '2px', backgroundColor: '#DDD', transform: 'translateX(-50%)' },
  feedback: { marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #EEE', display: 'flex', alignItems: 'center', gap: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBody: { backgroundColor: '#FFF', padding: '25px', borderRadius: '8px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
};

// --- Constants ---
const EMOJIS = ['✨', '🚀', '🛠️', '🐛', '📦', '🎁', '🔔', '📈', '⚡', '🔒', '🎨', '✍️'];

const App: React.FC = () => {
  const [view, setView] = useState<View>('updates');
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [updates, setUpdates] = useState<UpdateEntry[]>([]);
  const [categories, setCategories] = useState<string[]>(['Заполнение каталога', 'API', 'Настройки']);
  const [tagsList, setTagsList] = useState<string[]>(['Биллинг', 'Сетка', 'Webhooks', 'Настройки', 'Безопасность', 'Новинка']);
  
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openThemes, setOpenThemes] = useState<Set<string>>(new Set());

  // Modal State
  const [modal, setModal] = useState<ModalType>('none');
  const [modalInput, setModalInput] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);
  const updEditorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editor states
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editDate, setEditDate] = useState(new Date().toISOString().slice(0, 16));
  const [isSaving, setIsSaving] = useState(false);

  // Update editor states
  const [updTitle, setUpdTitle] = useState('');
  const [updEmoji, setUpdEmoji] = useState('✨');
  const [updType, setUpdType] = useState<UpdateType>('Новый функционал');

  // Initialize data
  useEffect(() => {
    const timer = setTimeout(() => {
      setArticles([
        { id: '1', category: 'Заполнение каталога', title: 'Как создать шахматку', subtitle: 'Основы работы с графической сеткой', content: '<h2>Создание шахматки</h2><p>Нажмите <strong>"Генерировать"</strong>.</p>', helpfulCount: 25, unhelpfulCount: 3, tags: ['сетка'], publishedAt: new Date().toISOString(), versions: [] },
        { id: '2', category: 'API', title: 'Работа с вебхуками', subtitle: 'Автоматизация уведомлений', content: '<h2>Вебхуки</h2><p>Настройте URL в кабинете.</p>', helpfulCount: 42, unhelpfulCount: 1, tags: ['webhooks'], publishedAt: new Date(Date.now() + 86400000).toISOString(), versions: [] }
      ]);
      setUpdates([
        { id: 'u1', title: 'Начисления в проектах', description: '<p>Теперь для проектов тоже доступно ручное начисление выручки и расходов, как для сделок. Это можно делать в интерфейсе проекта и на странице отчета о прибылях и убытках (P&L). Интеграция с Google-таблицами или по API здесь так же будет работать.</p>', date: '4 сентября 2025', emoji: '✍️', type: 'Новый функционал', publishedAt: new Date().toISOString(), likes: 154 },
        { id: 'u2', title: 'Прокачали Startup Pack', description: '<p>Startup Pack — это модуль для подготовки красивой отчетности о работе вашей компании. Теперь его могут использовать не только стартапы для отчетов инвесторам, но и любой другой бизнес.</p>', date: '9 июля 2025', emoji: '✨', type: 'Улучшения', publishedAt: new Date().toISOString(), likes: 337 }
      ]);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Helpers
  const isPublished = (dateStr: string) => new Date(dateStr) <= new Date();

  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      if (!isAdmin && !isPublished(a.publishedAt)) return false;
      const query = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(query) || 
             (a.subtitle && a.subtitle.toLowerCase().includes(query)) ||
             a.category.toLowerCase().includes(query) ||
             a.content.toLowerCase().includes(query);
    });
  }, [searchQuery, articles, isAdmin]);

  const sidebarThemes = useMemo(() => {
    const active = filteredArticles.map(a => a.category);
    return Array.from(new Set(active));
  }, [filteredArticles]);

  const scheduledArticles = useMemo(() => articles.filter(a => !isPublished(a.publishedAt)), [articles]);

  // --- Toolbar Handlers ---
  const exec = (cmd: string, val: any = null) => {
    document.execCommand(cmd, false, val);
    if (view === 'editor') editorRef.current?.focus();
    else if (view === 'updateEditor') updEditorRef.current?.focus();
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const img = `<img src="${base64}" style="max-width: 100%; height: auto; border-radius: 6px; margin: 20px 0; display: block;" />`;
      exec('insertHTML', img);
    };
    reader.readAsDataURL(file);
  };

  const insertVideo = () => {
    const url = prompt('Введите ссылку на видео (например, YouTube embed URL):');
    if (!url) return;
    const embed = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:6px;margin:20px 0;"><iframe src="${url}" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe></div>`;
    exec('insertHTML', embed);
  };

  // --- Actions ---
  const saveArticle = () => {
    setIsSaving(true);
    const content = editorRef.current?.innerHTML || '';
    const oldArticle = articles.find(a => a.id === editId);
    
    const currentVersions = oldArticle ? [...oldArticle.versions, oldArticle.content] : [];

    const newArt: KBArticle = {
      id: editId || Date.now().toString(),
      title: editTitle,
      subtitle: editSubtitle,
      category: editCategory,
      content,
      tags: editTags,
      publishedAt: new Date(editDate).toISOString(),
      helpfulCount: oldArticle?.helpfulCount || 0,
      unhelpfulCount: oldArticle?.unhelpfulCount || 0,
      versions: currentVersions
    };

    setArticles(prev => {
      if (editId) return prev.map(a => a.id === editId ? newArt : a);
      return [...prev, newArt];
    });

    setTimeout(() => { 
      setIsSaving(false); 
      setView('article');
      setSelectedArticle(newArt);
    }, 300);
  };

  const saveUpdate = () => {
    const desc = updEditorRef.current?.innerHTML || '';
    const newUpd: UpdateEntry = {
      id: Date.now().toString(),
      title: updTitle,
      description: desc,
      date: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
      emoji: updEmoji,
      type: updType,
      publishedAt: new Date().toISOString(),
      likes: 0
    };
    setUpdates(prev => [newUpd, ...prev]);
    setView('updates');
  };

  const deleteArticle = (id: string) => {
    if (!confirm('Переместить статью в корзину?')) return;
    
    setArticles(prevArticles => {
      const toDelete = prevArticles.find(a => a.id === id);
      if (toDelete) {
        setTrash(prevTrash => [...prevTrash, { type: 'article', data: toDelete }]);
        return prevArticles.filter(a => a.id !== id);
      }
      return prevArticles;
    });

    if (selectedArticle?.id === id) {
      setSelectedArticle(null);
      setView('updates');
    }
  };

  const deleteUpdate = (id: string) => {
    if (!confirm('Переместить это обновление в корзину?')) return;
    
    setUpdates(prevUpdates => {
      const toDelete = prevUpdates.find(u => u.id === id);
      if (toDelete) {
        setTrash(prevTrash => [...prevTrash, { type: 'update', data: toDelete }]);
        return prevUpdates.filter(u => u.id !== id);
      }
      return prevUpdates;
    });
  };

  const publishNow = (article: KBArticle) => {
    const updated = { ...article, publishedAt: new Date().toISOString() };
    setArticles(prev => prev.map(a => a.id === article.id ? updated : a));
    if (selectedArticle?.id === article.id) setSelectedArticle(updated);
    alert('Статья опубликована!');
  };

  const restoreItem = (index: number) => {
    const item = trash[index];
    if (item.type === 'article') {
      setArticles(prev => [...prev, item.data]);
    } else {
      setUpdates(prev => [item.data, ...prev]);
    }
    setTrash(prev => prev.filter((_, i) => i !== index));
  };

  const permanentlyDeleteItem = (index: number) => {
    if (!confirm('Удалить навсегда? Это действие нельзя отменить.')) return;
    setTrash(prev => prev.filter((_, i) => i !== index));
  };

  const handleModalSave = () => {
    const input = modalInput.trim();
    if (!input) return;
    
    if (modal === 'addTopic') {
      setCategories(prev => {
        if (!prev.includes(input)) return [...prev, input];
        return prev;
      });
      setEditCategory(input);
    } else if (modal === 'addTag') {
      setTagsList(prev => {
        if (!prev.includes(input)) return [...prev, input];
        return prev;
      });
      setEditTags(prev => {
        if (!prev.includes(input)) return [...prev, input];
        return prev;
      });
    }
    setModal('none');
    setModalInput('');
  };

  const handleTagToggle = (tag: string) => {
    setEditTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const getBadgeColor = (type: UpdateType) => {
    switch(type) {
      case 'Новый функционал': return '#4CAF50';
      case 'Улучшения': return '#69C';
      case 'Исправлено': return '#FF9800';
      default: return '#999';
    }
  };

  const Toolbar = () => (
    <div style={styles.wordToolbar}>
      <button style={styles.buttonSecondary} onClick={() => exec('bold')}><b>B</b></button>
      <button style={styles.buttonSecondary} onClick={() => exec('italic')}><i>I</i></button>
      <button style={styles.buttonSecondary} onClick={() => exec('insertUnorderedList')}>• Список</button>
      <div style={{ width: '1px', height: '20px', background: '#DDD' }} />
      <select 
        style={{ ...styles.input, width: 'auto', marginBottom: 0, padding: '4px' }}
        onChange={(e) => exec('fontSize', e.target.value)}
      >
        <option value="3">Размер</option>
        {[1,2,3,4,5,6,7].map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      <div style={{ width: '1px', height: '20px', background: '#DDD' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input type="color" style={{ opacity: 0, position: 'absolute', width: '32px', cursor: 'pointer' }} onChange={e => exec('foreColor', e.target.value)} />
        <Icons.Palette />
      </div>
      <button style={styles.buttonSecondary} title="Рубль" onClick={() => exec('insertHTML', '₽')}>₽</button>
      <button style={styles.buttonSecondary} title="Смайл" onClick={() => exec('insertHTML', '😊')}>😊</button>
      <button style={styles.buttonSecondary} title="Стрелка" onClick={() => exec('insertHTML', '→')}>→</button>
      <div style={{ width: '1px', height: '20px', background: '#DDD' }} />
      <button style={styles.buttonSecondary} onClick={() => fileInputRef.current?.click()}><Icons.Image /></button>
      <button style={styles.buttonSecondary} onClick={insertVideo}><Icons.Video /></button>
    </div>
  );

  return (
    <React.Fragment>
      {/* Modal */}
      {modal !== 'none' && (
        <div style={styles.modalOverlay} onClick={() => setModal('none')}>
          <div style={styles.modalBody} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{modal === 'addTopic' ? 'Новая тема' : 'Новый тег'}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setModal('none')}><Icons.X /></button>
            </div>
            <input 
              style={styles.input} 
              autoFocus 
              placeholder={modal === 'addTopic' ? 'Название темы' : 'Название тега'} 
              value={modalInput} 
              onChange={e => setModalInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleModalSave()}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button style={{ ...styles.button, flex: 1 }} onClick={handleModalSave}>Сохранить</button>
              <button style={{ ...styles.buttonSecondary, flex: 1 }} onClick={() => setModal('none')}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.sidebar}>
        <div style={styles.adminBar}>
          <div style={{ ...styles.navItem, backgroundColor: isAdmin ? '#69C' : '#FFF', color: isAdmin ? '#FFF' : '#333', borderRadius: '6px', border: '1px solid #DDD', marginBottom: '10px' }} onClick={() => setIsAdmin(!isAdmin)}>
            🛡️ {isAdmin ? 'Админ: ВКЛ' : 'Включить Админ'}
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button style={{ ...styles.button, width: '100%', marginBottom: '5px' }} onClick={() => { setEditId(null); setEditTitle(''); setEditSubtitle(''); setEditCategory(categories[0]); setEditTags([]); setView('editor'); }}>
                <Icons.Plus /> Статья
              </button>
              <button style={{ ...styles.buttonSecondary, width: '100%', marginBottom: '5px' }} onClick={() => { setUpdTitle(''); setView('updateEditor'); }}>
                <Icons.Plus /> Обновление
              </button>
              <div style={{ borderBottom: '1px solid #DDD', margin: '5px 0' }} />
              <div style={{ ...styles.navItem, padding: '5px 10px', fontSize: '13px' }} onClick={() => setView('analytics')}><Icons.Analytics /> Аналитика</div>
              <div style={{ ...styles.navItem, padding: '5px 10px', fontSize: '13px' }} onClick={() => setView('scheduled')}><Icons.Clock /> Отложенные ({scheduledArticles.length})</div>
              <div style={{ ...styles.navItem, padding: '5px 10px', fontSize: '13px' }} onClick={() => setView('trash')}><Icons.Trash /> Корзина ({trash.length})</div>
            </div>
          )}
        </div>

        <div style={{ ...styles.navItem, ...(view === 'updates' ? styles.navItemActive : {}) }} onClick={() => setView('updates')}>✨ Обновления</div>

        <div style={styles.sidebarSearchContainer}>
          <div style={{ position: 'absolute', left: '12px', top: '12px' }}><Icons.Search /></div>
          <input style={styles.sidebarSearchInput} placeholder="Поиск" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {sidebarThemes.map(theme => (
          <div key={theme}>
            <div style={styles.navItem} onClick={() => {
              const next = new Set(openThemes);
              openThemes.has(theme) ? next.delete(theme) : next.add(theme);
              setOpenThemes(next);
            }}>
              <Icons.Folder open={openThemes.has(theme)} />
              <span style={{ flex: 1 }}>{theme}</span>
            </div>
            {openThemes.has(theme) && (
              <div>
                {filteredArticles.filter(a => a.category === theme).map(article => (
                  <div key={article.id} style={{ ...styles.subItem, ...(selectedArticle?.id === article.id ? styles.subItemActive : {}) }} onClick={() => { setSelectedArticle(article); setView('article'); }}>
                    <Icons.Article /> {article.title}
                    {!isPublished(article.publishedAt) && <span style={{ ...styles.badge, backgroundColor: '#EAEAEA', color: '#666' }}>⏰</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.mainContent}>
        {view === 'article' && selectedArticle && (
          <div>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#69C', cursor: 'pointer' }} onClick={() => setView('updates')}>← Назад</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {isAdmin && <button style={styles.buttonSecondary} onClick={() => setView('versionHistory')}><Icons.History /> Версии ({selectedArticle.versions.length})</button>}
                {isAdmin && <button style={styles.buttonSecondary} onClick={() => { setEditId(selectedArticle.id); setEditTitle(selectedArticle.title); setEditSubtitle(selectedArticle.subtitle || ''); setEditCategory(selectedArticle.category); setEditTags(selectedArticle.tags); setEditDate(new Date(selectedArticle.publishedAt).toISOString().slice(0, 16)); setView('editor'); }}>Редактировать</button>}
                {isAdmin && <button style={styles.buttonDanger} onClick={() => deleteArticle(selectedArticle.id)}><Icons.Trash /> Удалить</button>}
              </div>
            </div>
            <div style={styles.container}>
              {!isPublished(selectedArticle.publishedAt) && (
                <div style={{ backgroundColor: '#FFF9C4', padding: '15px', borderRadius: '4px', marginBottom: '20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>⚠️ Эта статья отложена и будет опубликована {new Date(selectedArticle.publishedAt).toLocaleString()}</span>
                  <button style={styles.button} onClick={() => publishNow(selectedArticle)}>Опубликовать сейчас</button>
                </div>
              )}
              <h1 style={styles.h1}>{selectedArticle.title}</h1>
              {selectedArticle.subtitle && <h2 style={{ fontSize: '18px', color: '#666', marginBottom: '15px', marginTop: '-10px' }}>{selectedArticle.subtitle}</h2>}
              <div style={{ marginBottom: '20px' }}>
                {selectedArticle.tags.map(tag => <span key={tag} style={styles.tag}>#{tag}</span>)}
              </div>
              <div className="article-body" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
              
              <div style={styles.feedback}>
                <span style={{ fontWeight: 500 }}>Было полезно?</span>
                <button style={styles.buttonSecondary} onClick={() => alert('Спасибо за отзыв!')}>👍 Да</button>
                <button style={styles.buttonSecondary} onClick={() => alert('Что мы можем улучшить?')}>👎 Нет</button>
              </div>
            </div>
          </div>
        )}

        {view === 'updates' && (
          <div style={{ position: 'relative' }}>
            <h1 style={{ ...styles.h1, textAlign: 'center', marginBottom: '60px', position: 'relative', zIndex: 10 }}>История обновлений</h1>
            <div style={styles.timelineLine} />
            <div className="timeline-items">
              {updates.map((u, index) => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '60px', position: 'relative' }}>
                  <div style={{ width: '45%', textAlign: index % 2 === 0 ? 'right' : 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}>
                    {index % 2 === 0 ? <span style={{ color: '#7F7F7E', fontSize: '14px', fontWeight: 500 }}>{u.date}</span> : 
                    <div style={{ ...styles.container, margin: 0, textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', paddingBottom: '10px', borderBottom: '1px solid #EEE' }}>
                        <span style={{ fontSize: '20px' }}>{u.emoji}</span>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', flex: 1 }}>{u.title}</h3>
                        {isAdmin && <button style={{ ...styles.buttonDanger, padding: '4px' }} onClick={() => deleteUpdate(u.id)} title="В корзину"><Icons.Trash /></button>}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ backgroundColor: getBadgeColor(u.type), color: '#FFF', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{u.type}</span>
                      </div>
                      <div className="article-body" style={{ fontSize: '14px' }} dangerouslySetInnerHTML={{ __html: u.description }} />
                    </div>}
                  </div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#BBB', border: '3px solid #FFF', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }} />
                  <div style={{ width: '45%', textAlign: index % 2 === 0 ? 'left' : 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}>
                    {index % 2 === 0 ? 
                    <div style={{ ...styles.container, margin: 0, textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', paddingBottom: '10px', borderBottom: '1px solid #EEE' }}>
                        <span style={{ fontSize: '20px' }}>{u.emoji}</span>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', flex: 1 }}>{u.title}</h3>
                        {isAdmin && <button style={{ ...styles.buttonDanger, padding: '4px' }} onClick={() => deleteUpdate(u.id)} title="В корзину"><Icons.Trash /></button>}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ backgroundColor: getBadgeColor(u.type), color: '#FFF', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{u.type}</span>
                      </div>
                      <div className="article-body" style={{ fontSize: '14px' }} dangerouslySetInnerHTML={{ __html: u.description }} />
                    </div> : <span style={{ color: '#7F7F7E', fontSize: '14px', fontWeight: 500 }}>{u.date}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'editor' && (
          <div className="editor-view">
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <h1 style={styles.h1}>{editId ? 'Редактировать статью' : 'Новая статья'}</h1>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={styles.buttonSecondary} onClick={() => setView('updates')}>Отмена</button>
                <button style={styles.button} onClick={saveArticle}>{isSaving ? '...' : 'Сохранить'}</button>
              </div>
            </div>
            <div style={styles.container}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <select style={{ ...styles.input, flex: 1, marginBottom: 0 }} value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button style={styles.buttonSecondary} onClick={() => setModal('addTopic')}>+</button>
                </div>
                <input style={{...styles.input, marginBottom: 0}} placeholder="Главный заголовок" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              </div>
              <input style={styles.input} placeholder="Подзаголовок (опционально)" value={editSubtitle} onChange={e => setEditSubtitle(e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <input type="datetime-local" style={{...styles.input, marginBottom: 0}} value={editDate} onChange={e => setEditDate(e.target.value)} />
                <div style={{ display: 'flex', gap: '5px' }}>
                  <div style={{ ...styles.input, minHeight: '40px', flex: 1, display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: 0 }}>
                    {editTags.map(tag => (
                      <span key={tag} style={{ ...styles.tag, backgroundColor: '#69C', color: '#FFF', marginRight: 0 }}>{tag} <span style={{ cursor: 'pointer' }} onClick={() => handleTagToggle(tag)}>×</span></span>
                    ))}
                    {editTags.length === 0 && <span style={{ color: '#999', fontSize: '13px' }}>Теги...</span>}
                  </div>
                  <button style={styles.buttonSecondary} onClick={() => setModal('addTag')}>+</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                {tagsList.map(tag => (
                  <button key={tag} onClick={() => handleTagToggle(tag)} style={{ ...styles.tag, cursor: 'pointer', border: '1px solid #DDD', backgroundColor: editTags.includes(tag) ? '#69C' : '#FFF', color: editTags.includes(tag) ? '#FFF' : '#666' }}>{tag}</button>
                ))}
              </div>
              <Toolbar />
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={e => e.target.files && handleImageUpload(e.target.files[0])} />
              <div ref={editorRef} contentEditable style={styles.visualEditor} onInput={() => {}} dangerouslySetInnerHTML={{ __html: articles.find(a => a.id === editId)?.content || '' }} />
            </div>
          </div>
        )}

        {view === 'updateEditor' && (
          <div>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <h1 style={styles.h1}>Новое обновление</h1>
              <button style={styles.button} onClick={saveUpdate}>Опубликовать</button>
            </div>
            <div style={styles.container}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <input style={{...styles.input, marginBottom: 0}} placeholder="Заголовок" value={updTitle} onChange={e => setUpdTitle(e.target.value)} />
                <select style={{...styles.input, marginBottom: 0}} value={updType} onChange={e => setUpdType(e.target.value as UpdateType)}>
                  <option value="Новый функционал">Новый функционал</option>
                  <option value="Улучшения">Улучшения</option>
                  <option value="Исправлено">Исправлено</option>
                </select>
                <div>
                  <input style={{...styles.input, marginBottom: '5px'}} placeholder="Эмодзи" value={updEmoji} onChange={e => setUpdEmoji(e.target.value)} />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {EMOJIS.slice(0, 8).map(e => <span key={e} style={{ cursor: 'pointer' }} onClick={() => setUpdEmoji(e)}>{e}</span>)}
                  </div>
                </div>
              </div>
              <Toolbar />
              <div ref={updEditorRef} contentEditable style={styles.visualEditor} />
            </div>
          </div>
        )}

        {view === 'versionHistory' && selectedArticle && (
          <div>
            <h1 style={styles.h1}>История версий: {selectedArticle.title}</h1>
            <button style={{...styles.buttonSecondary, marginBottom: '20px'}} onClick={() => setView('article')}>← Назад к статье</button>
            {selectedArticle.versions.length === 0 ? <p>История пуста.</p> : 
              selectedArticle.versions.map((content, idx) => (
                <div key={idx} style={styles.container}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EEE', marginBottom: '15px', paddingBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>Версия {idx + 1}</div>
                    <span style={{ color: '#999', fontSize: '12px' }}>Архивная копия</span>
                  </div>
                  <div className="article-body" dangerouslySetInnerHTML={{ __html: content }} />
                  <button style={{...styles.button, marginTop: '15px'}} onClick={() => {
                    const restored = { ...selectedArticle, content, versions: [...selectedArticle.versions, selectedArticle.content] };
                    setArticles(prev => prev.map(a => a.id === selectedArticle.id ? restored : a));
                    setSelectedArticle(restored);
                    setView('article');
                  }}>Восстановить эту версию</button>
                </div>
              ))
            }
          </div>
        )}

        {view === 'scheduled' && (
          <div>
            <h1 style={styles.h1}>Отложенные статьи</h1>
            {scheduledArticles.length === 0 ? <p>Нет запланированных статей.</p> : scheduledArticles.map(a => (
              <div key={a.id} style={{ ...styles.container, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{a.title}</h3>
                  <span style={{ color: '#69C', fontSize: '13px' }}>📅 Публикация: {new Date(a.publishedAt).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={styles.button} onClick={() => publishNow(a)}>Опубликовать сейчас</button>
                  <button style={styles.buttonSecondary} onClick={() => { setSelectedArticle(a); setView('article'); }}>Просмотр</button>
                  <button style={styles.buttonDanger} onClick={() => deleteArticle(a.id)}><Icons.Trash /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'analytics' && (
          <div>
            <h1 style={styles.h1}>Аналитика</h1>
            <div style={styles.container}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '2px solid #DDD', textAlign: 'left' }}><th style={{ padding: '10px' }}>Статья</th><th style={{ padding: '10px' }}>👍</th><th style={{ padding: '10px' }}>👎</th></tr></thead>
                <tbody>
                  {articles.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #EEE' }}><td style={{ padding: '10px' }}>{a.title}</td><td style={{ padding: '10px', color: '#4CAF50' }}>{a.helpfulCount}</td><td style={{ padding: '10px', color: '#F44336' }}>{a.unhelpfulCount}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'trash' && (
          <div>
            <h1 style={styles.h1}>Корзина</h1>
            {trash.length === 0 ? <p>Корзина пуста</p> : trash.map((t, idx) => (
              <div key={idx} style={{ ...styles.container, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {t.type === 'article' ? <Icons.Article /> : <Icons.Stars />}
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{t.data.title}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{t.type === 'article' ? 'Статья' : 'Обновление'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={styles.button} onClick={() => restoreItem(idx)}>Восстановить</button>
                  <button style={styles.buttonDanger} onClick={() => permanentlyDeleteItem(idx)}>Удалить навсегда</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .article-body h2 { border-bottom: 1px solid #EEE; padding-bottom: 5px; margin-top: 25px; color: #7F7F7E; font-size: 18px; }
        .article-body p { margin-bottom: 15px; }
        .article-body ul { padding-left: 20px; margin-bottom: 15px; }
        .article-body img { max-width: 100%; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        select { background: #FFF; cursor: pointer; }
      `}</style>
    </React.Fragment>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
