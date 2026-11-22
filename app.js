(function () {
  'use strict';

  const STORAGE_KEY_TASKS = 'techsolutions_tasks_v1';
  const STORAGE_KEY_THEME = 'techsolutions_theme_v1';
  const STORAGE_KEY_VIEW = 'techsolutions_view_v1';
  const STORAGE_KEY_LAST_AUTHOR = 'techsolutions_last_author_v1';

  const INITIAL_TASKS = [
    {
      id: 'ts-1',
      code: 'TS-101',
      title: 'Integrar API de roteirização logística com rastreamento GPS',
      assignee: 'Júlia Egito',
      type: 'feature',
      status: 'in_progress',
      dueDate: getRelativeDate(1),
      description: 'Desenvolver serviço assíncrono para processar telemetria de frotas e emitir estimativas de chegada para transportadoras.',
      comments: [
        {
          id: 'c1',
          author: 'Clara Barreto',
          text: 'O cliente precisa de resposta abaixo de 200ms para até 500 caminhões simultâneos.',
          date: 'Ontem às 14:30'
        },
        {
          id: 'c2',
          author: 'Fernanda',
          text: 'Adicionei camada de cache Redis. Testes de estresse começam amanhã.',
          date: 'Hoje às 10:15'
        }
      ]
    },
    {
      id: 'ts-2',
      code: 'TS-102',
      title: 'Módulo de prontuário eletrônico com assinatura digital',
      assignee: 'Clara Barreto',
      type: 'feature',
      status: 'backlog',
      dueDate: getRelativeDate(5),
      description: 'Levantamento de requisitos de conformidade com padrões de saúde e integração com certificado ICP-Brasil.',
      comments: [
        {
          id: 'c3',
          author: 'Clara Barreto',
          text: 'Depende da homologação jurídica do cliente antes de entrar no Sprint 25.',
          date: 'Hoje às 09:00'
        }
      ]
    },
    {
      id: 'ts-3',
      code: 'TS-103',
      title: 'Correção: Timeout no cálculo de frete interestadual',
      assignee: 'Fernanda',
      type: 'fix',
      status: 'in_progress',
      dueDate: getRelativeDate(0),
      description: 'Tabelas legadas sem índice na coluna cep_destino estão causando lock no banco em horários de pico.',
      comments: []
    },
    {
      id: 'ts-4',
      code: 'TS-104',
      title: 'Automatizar pipeline de deploy com testes de regressão (CI/CD)',
      assignee: 'Júlia Egito',
      type: 'refactor',
      status: 'backlog',
      dueDate: getRelativeDate(7),
      description: 'Configurar GitHub Actions para rodar a suíte Cypress antes de aprovar PRs para staging.',
      comments: []
    },
    {
      id: 'ts-5',
      code: 'TS-105',
      title: 'Refatoração da camada de autenticação JWT e renovação de token',
      assignee: 'Leonel',
      type: 'refactor',
      status: 'completed',
      dueDate: getRelativeDate(-2),
      description: 'Migração para HttpOnly cookies para mitigar ataques XSS em ambientes hospitalares.',
      comments: [
        {
          id: 'c4',
          author: 'Leonel',
          text: 'Validado em staging! Sem problemas de expiração de sessão.',
          date: 'Ontem às 16:40'
        }
      ]
    }
  ];

  let tasks = [];
  let currentFilter = {
    search: '',
    assignee: 'ALL',
    type: 'ALL'
  };
  let currentView = 'board';
  let activeDetailTask = null;
  let draggedTaskId = null;

  const dom = {

    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),

    sprintProgressBar: document.getElementById('sprintProgressBar'),
    sprintProgressPercent: document.getElementById('sprintProgressPercent'),
    statTotal: document.getElementById('statTotal'),
    statInProgress: document.getElementById('statInProgress'),
    statUrgent: document.getElementById('statUrgent'),
    statCompleted: document.getElementById('statCompleted'),

    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    memberFilter: document.getElementById('memberFilter'),
    typeFilter: document.getElementById('typeFilter'),
    viewBoardBtn: document.getElementById('viewBoardBtn'),
    viewListBtn: document.getElementById('viewListBtn'),
    btnClearCompleted: document.getElementById('btnClearCompleted'),
    btnResetData: document.getElementById('btnResetData'),

    boardContainer: document.getElementById('boardContainer'),
    listContainer: document.getElementById('listContainer'),
    listTableBody: document.getElementById('listTableBody'),
    dropzones: {
      backlog: document.getElementById('dropzoneBacklog'),
      in_progress: document.getElementById('dropzoneInProgress'),
      completed: document.getElementById('dropzoneCompleted')
    },
    counts: {
      backlog: document.getElementById('countBacklog'),
      in_progress: document.getElementById('countInProgress'),
      completed: document.getElementById('countCompleted')
    },

    taskModal: document.getElementById('taskModal'),
    taskForm: document.getElementById('taskForm'),
    btnNewTask: document.getElementById('btnNewTask'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalCancelBtn: document.getElementById('modalCancelBtn'),
    modalTitle: document.getElementById('modalTitle'),
    modalCodeTag: document.getElementById('modalCodeTag'),
    taskIdInput: document.getElementById('taskId'),
    taskTitleInput: document.getElementById('taskTitle'),
    taskAssigneeInput: document.getElementById('taskAssignee'),
    assigneeSuggestions: document.getElementById('assigneeSuggestions'),
    taskTypeInput: document.getElementById('taskType'),
    taskDueDateInput: document.getElementById('taskDueDate'),
    taskStatusInput: document.getElementById('taskStatus'),
    taskDescriptionInput: document.getElementById('taskDescription'),

    detailModal: document.getElementById('detailModal'),
    detailCloseBtn: document.getElementById('detailCloseBtn'),
    detailCode: document.getElementById('detailCode'),
    detailTypeBadge: document.getElementById('detailTypeBadge'),
    detailTitle: document.getElementById('detailTitle'),
    detailDescription: document.getElementById('detailDescription'),
    detailAssignee: document.getElementById('detailAssignee'),
    detailDueDateBadge: document.getElementById('detailDueDateBadge'),
    detailDueDateText: document.getElementById('detailDueDateText'),
    detailStatusSelect: document.getElementById('detailStatusSelect'),
    btnEditFromDetail: document.getElementById('btnEditFromDetail'),
    btnDeleteFromDetail: document.getElementById('btnDeleteFromDetail'),

    commentsList: document.getElementById('commentsList'),
    commentForm: document.getElementById('commentForm'),
    commentAuthor: document.getElementById('commentAuthor'),
    commentText: document.getElementById('commentText'),

    toastContainer: document.getElementById('toastContainer')
  };

  function init() {
    loadTheme();
    loadTasks();
    loadViewPreference();
    setupEventListeners();
    render();
  }

  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TASKS);
      if (stored) {
        tasks = JSON.parse(stored);
      } else {
        tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
        saveTasks();
      }
    } catch (e) {
      console.error('Falha ao carregar tarefas do storage', e);
      tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Falha ao salvar tarefas', e);
    }
  }

  function resetToDefault() {
    if (confirm('Deseja restaurar as tarefas padrão do estudo de caso da TechSolutions?')) {
      tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
      saveTasks();
      render();
      showToast('Dados restaurados para o padrão do Sprint!', 'info');
    }
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'light';
    applyTheme(savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
    showToast(next === 'dark' ? 'Modo Escuro ativado!' : 'Modo Claro ativado!', 'info');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      dom.themeIcon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
    } else {
      dom.themeIcon.innerHTML = `
        <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
      `;
    }
  }

  function loadViewPreference() {
    const saved = localStorage.getItem(STORAGE_KEY_VIEW);
    if (saved === 'list') {
      setView('list');
    } else {
      setView('board');
    }
  }

  function setView(view) {
    currentView = view;
    localStorage.setItem(STORAGE_KEY_VIEW, view);
    if (view === 'list') {
      dom.boardContainer.classList.add('hidden');
      dom.listContainer.classList.remove('hidden');
      dom.viewListBtn.classList.add('active');
      dom.viewBoardBtn.classList.remove('active');
    } else {
      dom.listContainer.classList.add('hidden');
      dom.boardContainer.classList.remove('hidden');
      dom.viewBoardBtn.classList.add('active');
      dom.viewListBtn.classList.remove('active');
    }
    render();
  }

  function render() {
    updateAssigneeFilterAndDatalist();
    const filtered = getFilteredTasks();

    updateMetrics();

    if (currentView === 'board') {
      renderBoard(filtered);
    } else {
      renderList(filtered);
    }
  }

  function updateAssigneeFilterAndDatalist() {
    const namesSet = new Set();
    tasks.forEach(t => {
      if (t.assignee && t.assignee.trim()) {
        namesSet.add(t.assignee.trim());
      }
      if (t.comments) {
        t.comments.forEach(c => {
          if (c.author && c.author.trim()) {
            namesSet.add(c.author.trim());
          }
        });
      }
    });

    const uniqueNames = Array.from(namesSet).sort((a, b) => a.localeCompare(b));

    const currentVal = currentFilter.assignee || 'ALL';
    dom.memberFilter.innerHTML = '<option value="ALL">Todos os Responsáveis</option>';
    uniqueNames.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === currentVal) opt.selected = true;
      dom.memberFilter.appendChild(opt);
    });

    if (currentVal !== 'ALL' && !uniqueNames.includes(currentVal)) {
      currentFilter.assignee = 'ALL';
      dom.memberFilter.value = 'ALL';
    }

    if (dom.assigneeSuggestions) {
      dom.assigneeSuggestions.innerHTML = '';
      uniqueNames.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        dom.assigneeSuggestions.appendChild(opt);
      });
    }
  }

  function getFilteredTasks() {
    return tasks.filter(task => {

      if (currentFilter.search) {
        const query = currentFilter.search.toLowerCase();
        const matchesCode = task.code.toLowerCase().includes(query);
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        if (!matchesCode && !matchesTitle && !matchesDesc) return false;
      }

      if (currentFilter.assignee !== 'ALL' && task.assignee !== currentFilter.assignee) {
        return false;
      }

      if (currentFilter.type !== 'ALL' && task.type !== currentFilter.type) {
        return false;
      }

      return true;
    });
  }

  function updateMetrics() {
    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const urgent = tasks.filter(t => t.status !== 'completed' && isUrgent(t.dueDate)).length;

    dom.statTotal.textContent = total;
    dom.statInProgress.textContent = inProgress;
    dom.statUrgent.textContent = urgent;
    dom.statCompleted.textContent = completed;

    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    dom.sprintProgressBar.style.width = `${pct}%`;
    dom.sprintProgressPercent.textContent = `${pct}%`;

    const filtered = getFilteredTasks();
    dom.counts.backlog.textContent = filtered.filter(t => t.status === 'backlog').length;
    dom.counts.in_progress.textContent = filtered.filter(t => t.status === 'in_progress').length;
    dom.counts.completed.textContent = filtered.filter(t => t.status === 'completed').length;
  }

  function renderBoard(filteredTasks) {
    const groups = {
      backlog: [],
      in_progress: [],
      completed: []
    };

    filteredTasks.forEach(task => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    });

    ['backlog', 'in_progress', 'completed'].forEach(status => {
      const dropzone = dom.dropzones[status];
      dropzone.innerHTML = '';

      const colTasks = groups[status];
      if (colTasks.length === 0) {
        dropzone.innerHTML = `
          <div class="empty-placeholder">
            <span>Nenhuma tarefa aqui</span>
          </div>
        `;
        return;
      }

      colTasks.forEach(task => {
        const card = createCardElement(task);
        dropzone.appendChild(card);
      });
    });
  }

  function createCardElement(task) {
    const card = document.createElement('div');
    card.className = `task-card card-${task.type} ${task.status === 'completed' ? 'card-completed' : ''}`;

    const urgent = task.status !== 'completed' && isUrgent(task.dueDate);
    if (urgent) card.classList.add('card-urgent');

    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', task.id);

    const initials = getInitials(task.assignee);
    const dateFormatted = formatDate(task.dueDate);
    const commentCount = task.comments ? task.comments.length : 0;

    card.innerHTML = `
      <div class="card-top">
        <span class="card-code font-mono">${escapeHtml(task.code)}</span>
        <div class="card-actions-quick" onclick="event.stopPropagation();">
          ${task.status !== 'completed' ? `
            <button class="btn-card-action btn-check-done" title="Marcar como Concluída" data-action="complete">
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          ` : `
            <button class="btn-card-action" title="Reabrir para Em Andamento" data-action="reopen">
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
            </button>
          `}
        </div>
      </div>

      <div class="card-title">${escapeHtml(task.title)}</div>

      <div class="card-footer">
        <div class="card-assignee" title="${escapeHtml(task.assignee)}">
          <span class="card-assignee-avatar">${initials}</span>
          <span>${escapeHtml(task.assignee.split(' ')[0])}</span>
        </div>

        <div class="card-meta-right" style="display:flex; align-items:center; gap:0.5rem;">
          ${commentCount > 0 ? `
            <span class="card-comments-indicator" title="${commentCount} comentários">
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              ${commentCount}
            </span>
          ` : ''}

          ${task.dueDate ? `
            <div class="card-date-badge ${urgent ? 'urgent' : ''}" title="Prazo: ${dateFormatted}">
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${dateFormatted}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    card.addEventListener('click', () => openDetailModal(task));

    card.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-action');
        if (action === 'complete') {
          updateTaskStatus(task.id, 'completed');
        } else if (action === 'reopen') {
          updateTaskStatus(task.id, 'in_progress');
        }
      });
    });

    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    return card;
  }

  function renderList(filteredTasks) {
    dom.listTableBody.innerHTML = '';

    if (filteredTasks.length === 0) {
      dom.listTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            Nenhuma tarefa encontrada no filtro selecionado.
          </td>
        </tr>
      `;
      return;
    }

    filteredTasks.forEach(task => {
      const tr = document.createElement('tr');
      if (task.status === 'completed') tr.classList.add('task-row-completed');

      const urgent = task.status !== 'completed' && isUrgent(task.dueDate);
      const isDone = task.status === 'completed';

      tr.innerHTML = `
        <td>
          <input type="checkbox" class="table-checkbox" ${isDone ? 'checked' : ''} title="Concluir tarefa">
        </td>
        <td class="font-mono" style="font-size: 0.8rem; font-weight: 600;">${escapeHtml(task.code)}</td>
        <td style="font-weight: 600;" class="table-title">${escapeHtml(task.title)}</td>
        <td>${escapeHtml(task.assignee)}</td>
        <td>
          <span style="${urgent ? 'color: var(--color-amber-deadline); font-weight: 600;' : ''}">
            ${task.dueDate ? formatDate(task.dueDate) : '—'}
          </span>
        </td>
        <td>
          <span class="badge-type badge-type-${task.type}">${getTypeLabel(task.type)}</span>
        </td>
        <td>
          <span class="badge-status badge-status-${task.status}">${getStatusLabel(task.status)}</span>
        </td>
        <td style="text-align: right;">
          <button class="btn-card-action" data-action="view" title="Ver detalhes">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </td>
      `;

      const chk = tr.querySelector('.table-checkbox');
      chk.addEventListener('change', () => {
        updateTaskStatus(task.id, chk.checked ? 'completed' : 'in_progress');
      });

      tr.querySelector('[data-action="view"]').addEventListener('click', () => {
        openDetailModal(task);
      });

      dom.listTableBody.appendChild(tr);
    });
  }

  function handleDragStart(e) {
    draggedTaskId = this.getAttribute('data-id');
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedTaskId);
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.cards-dropzone').forEach(dz => {
      dz.classList.remove('drag-over');
    });
    draggedTaskId = null;
  }

  function setupDragAndDrop() {
    Object.values(dom.dropzones).forEach(dropzone => {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        dropzone.classList.add('drag-over');
      });

      dropzone.addEventListener('dragleave', (e) => {
        if (!dropzone.contains(e.relatedTarget)) {
          dropzone.classList.remove('drag-over');
        }
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        const targetStatus = dropzone.getAttribute('data-status');
        if (draggedTaskId && targetStatus) {
          updateTaskStatus(draggedTaskId, targetStatus);
        }
      });
    });
  }

  function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    task.status = newStatus;
    saveTasks();
    render();

    if (newStatus === 'completed') {
      showToast(`Tarefa ${task.code} movida para Concluído! 🎉`, 'success');
    } else if (newStatus === 'in_progress') {
      showToast(`Tarefa ${task.code} em desenvolvimento! 🚀`, 'info');
    } else {
      showToast(`Tarefa ${task.code} movida para o Backlog.`, 'info');
    }

    if (activeDetailTask && activeDetailTask.id === taskId) {
      dom.detailStatusSelect.value = newStatus;
    }
  }

  function clearCompletedTasks() {
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    if (completedCount === 0) {
      showToast('Não há tarefas concluídas para limpar.', 'info');
      return;
    }

    if (confirm(`Deseja remover ${completedCount} tarefa(s) concluída(s) para manter a lista limpa?`)) {
      tasks = tasks.filter(t => t.status !== 'completed');
      saveTasks();
      render();
      showToast('Lista limpa com sucesso! Backlog focado. ✨', 'success');
    }
  }

  function openTaskModal(taskToEdit = null) {
    dom.taskForm.reset();

    if (taskToEdit) {
      dom.modalTitle.textContent = 'Editar Tarefa';
      dom.modalCodeTag.textContent = taskToEdit.code;
      dom.taskIdInput.value = taskToEdit.id;
      dom.taskTitleInput.value = taskToEdit.title;
      dom.taskAssigneeInput.value = taskToEdit.assignee || '';
      dom.taskTypeInput.value = taskToEdit.type;
      dom.taskDueDateInput.value = taskToEdit.dueDate || '';
      dom.taskStatusInput.value = taskToEdit.status;
      dom.taskDescriptionInput.value = taskToEdit.description || '';
    } else {
      dom.modalTitle.textContent = 'Criar Nova Tarefa';
      const nextNum = getNextTaskNumber();
      dom.modalCodeTag.textContent = `TS-${nextNum}`;
      dom.taskIdInput.value = '';
      dom.taskAssigneeInput.value = '';
      dom.taskDueDateInput.value = getRelativeDate(2);
      dom.taskStatusInput.value = 'backlog';
    }

    dom.taskModal.classList.remove('hidden');
    dom.taskTitleInput.focus();
  }

  function closeTaskModal() {
    dom.taskModal.classList.add('hidden');
  }

  function handleTaskFormSubmit(e) {
    e.preventDefault();

    const title = dom.taskTitleInput.value.trim();
    if (!title) return;

    const id = dom.taskIdInput.value;
    const assignee = dom.taskAssigneeInput.value.trim() || 'Equipe Dev';
    const type = dom.taskTypeInput.value;
    const dueDate = dom.taskDueDateInput.value;
    const status = dom.taskStatusInput.value;
    const description = dom.taskDescriptionInput.value.trim();

    if (id) {

      const task = tasks.find(t => t.id === id);
      if (task) {
        task.title = title;
        task.assignee = assignee;
        task.type = type;
        task.dueDate = dueDate;
        task.status = status;
        task.description = description;
        showToast(`Tarefa ${task.code} atualizada!`, 'success');
      }
    } else {

      const code = dom.modalCodeTag.textContent;
      const newTask = {
        id: 'ts-' + Date.now(),
        code: code,
        title: title,
        assignee: assignee,
        type: type,
        dueDate: dueDate,
        status: status,
        description: description,
        comments: []
      };
      tasks.unshift(newTask);
      showToast(`Tarefa ${code} criada com sucesso! 🚀`, 'success');
    }

    saveTasks();
    closeTaskModal();
    render();

    if (activeDetailTask && id && activeDetailTask.id === id) {
      const updated = tasks.find(t => t.id === id);
      if (updated) openDetailModal(updated);
    }
  }

  function getNextTaskNumber() {
    let max = 100;
    tasks.forEach(t => {
      const num = parseInt((t.code || '').replace(/\D/g, ''), 10);
      if (!isNaN(num) && num > max) max = num;
    });
    return max + 1;
  }

  function openDetailModal(task) {
    activeDetailTask = task;

    dom.detailCode.textContent = task.code;
    dom.detailTitle.textContent = task.title;
    dom.detailDescription.textContent = task.description || 'Nenhum detalhe adicional informado.';
    dom.detailAssignee.textContent = task.assignee;
    dom.detailStatusSelect.value = task.status;

    dom.detailTypeBadge.className = `badge-type badge-type-${task.type}`;
    dom.detailTypeBadge.textContent = getTypeLabel(task.type);

    const urgent = task.status !== 'completed' && isUrgent(task.dueDate);
    dom.detailDueDateText.textContent = task.dueDate ? formatDate(task.dueDate) : 'Sem prazo definido';
    if (urgent) {
      dom.detailDueDateBadge.style.color = '#D97706';
      dom.detailDueDateBadge.style.backgroundColor = 'var(--color-amber-subtle)';
      dom.detailDueDateBadge.style.padding = '0.2rem 0.5rem';
      dom.detailDueDateBadge.style.borderRadius = 'var(--radius-sm)';
    } else {
      dom.detailDueDateBadge.style.color = 'inherit';
      dom.detailDueDateBadge.style.backgroundColor = 'transparent';
      dom.detailDueDateBadge.style.padding = '0';
    }

    const savedAuthor = localStorage.getItem(STORAGE_KEY_LAST_AUTHOR);
    if (savedAuthor && !dom.commentAuthor.value) {
      dom.commentAuthor.value = savedAuthor;
    }

    renderComments(task);

    dom.detailModal.classList.remove('hidden');
  }

  function closeDetailModal() {
    dom.detailModal.classList.add('hidden');
    activeDetailTask = null;
  }

  function renderComments(task) {
    dom.commentsList.innerHTML = '';
    const comments = task.comments || [];

    if (comments.length === 0) {
      dom.commentsList.innerHTML = `
        <div style="font-size: 0.8rem; color: var(--text-subtle); padding: 0.5rem 0;">
          Nenhum comentário registrado ainda. Adicione uma dúvida ou atualização abaixo.
        </div>
      `;
      return;
    }

    comments.forEach(c => {
      const div = document.createElement('div');
      div.className = 'comment-item';
      div.innerHTML = `
        <div class="comment-header">
          <span class="comment-author-name">${escapeHtml(c.author)}</span>
          <span class="comment-time">${escapeHtml(c.date)}</span>
        </div>
        <div class="comment-body">${escapeHtml(c.text)}</div>
      `;
      dom.commentsList.appendChild(div);
    });

    dom.commentsList.scrollTop = dom.commentsList.scrollHeight;
  }

  function handleCommentSubmit(e) {
    e.preventDefault();
    if (!activeDetailTask) return;

    const text = dom.commentText.value.trim();
    if (!text) return;

    const author = dom.commentAuthor.value.trim() || 'Anônimo';
    localStorage.setItem(STORAGE_KEY_LAST_AUTHOR, author);

    const now = new Date();
    const dateFormatted = `Hoje às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (!activeDetailTask.comments) activeDetailTask.comments = [];
    activeDetailTask.comments.push({
      id: 'c_' + Date.now(),
      author: author,
      text: text,
      date: dateFormatted
    });

    saveTasks();
    dom.commentText.value = '';
    renderComments(activeDetailTask);
    render();
    showToast('Comentário registrado com sucesso!', 'info');
  }

  function deleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (confirm(`Tem certeza que deseja excluir a tarefa ${task.code} ("${task.title}")?`)) {
      tasks = tasks.filter(t => t.id !== taskId);
      saveTasks();
      closeDetailModal();
      render();
      showToast(`Tarefa ${task.code} removida.`, 'info');
    }
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function setupEventListeners() {

    dom.themeToggleBtn.addEventListener('click', toggleTheme);

    dom.viewBoardBtn.addEventListener('click', () => setView('board'));
    dom.viewListBtn.addEventListener('click', () => setView('list'));

    dom.searchInput.addEventListener('input', (e) => {
      currentFilter.search = e.target.value.trim();
      dom.clearSearchBtn.classList.toggle('hidden', !currentFilter.search);
      render();
    });

    dom.clearSearchBtn.addEventListener('click', () => {
      dom.searchInput.value = '';
      currentFilter.search = '';
      dom.clearSearchBtn.classList.add('hidden');
      render();
    });

    dom.memberFilter.addEventListener('change', (e) => {
      currentFilter.assignee = e.target.value;
      render();
    });

    dom.typeFilter.addEventListener('change', (e) => {
      currentFilter.type = e.target.value;
      render();
    });

    dom.btnClearCompleted.addEventListener('click', clearCompletedTasks);

    dom.btnResetData.addEventListener('click', resetToDefault);

    dom.btnNewTask.addEventListener('click', () => openTaskModal());
    dom.modalCloseBtn.addEventListener('click', closeTaskModal);
    dom.modalCancelBtn.addEventListener('click', closeTaskModal);
    dom.taskForm.addEventListener('submit', handleTaskFormSubmit);

    dom.detailCloseBtn.addEventListener('click', closeDetailModal);
    dom.detailStatusSelect.addEventListener('change', (e) => {
      if (activeDetailTask) {
        updateTaskStatus(activeDetailTask.id, e.target.value);
      }
    });

    dom.btnEditFromDetail.addEventListener('click', () => {
      if (activeDetailTask) {
        const taskToEdit = activeDetailTask;
        closeDetailModal();
        openTaskModal(taskToEdit);
      }
    });

    dom.btnDeleteFromDetail.addEventListener('click', () => {
      if (activeDetailTask) {
        deleteTask(activeDetailTask.id);
      }
    });

    dom.commentForm.addEventListener('submit', handleCommentSubmit);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeTaskModal();
        closeDetailModal();
      }
    });

    [dom.taskModal, dom.detailModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          activeDetailTask = null;
        }
      });
    });

    setupDragAndDrop();
  }

  function getRelativeDate(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  }

  function isUrgent(dueDateStr) {
    if (!dueDateStr) return false;
    const due = new Date(dueDateStr + 'T23:59:59');
    const now = new Date();
    const diffHours = (due - now) / (1000 * 60 * 60);

    return diffHours <= 36;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  }

  function getInitials(name) {
    if (!name) return 'TS';
    const clean = name.replace(/\(.*\)/, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  function getTypeLabel(type) {
    switch (type) {
      case 'feature': return 'Novo Recurso';
      case 'fix': return 'Correção';
      case 'refactor': return 'Melhoria';
      default: return type;
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case 'backlog': return 'Backlog';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      default: return status;
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
