/**
 * GANTT CHART INTEGRATION - Advanced Gantt Chart Implementation
 * Integrates ganttchart.html logic into index.html with Firebase real data
 *
 * Features:
 * - Drag & Drop task rescheduling
 * - Bar resize for duration adjustment
 * - Multiple timeline scales (Day, Week, Month)
 * - Today indicator line
 * - Synchronized scrolling
 * - Real-time Firebase updates
 */

// Extend Day.js with plugins
if (typeof dayjs !== 'undefined') {
    dayjs.extend(dayjs_plugin_isBetween);
    dayjs.extend(dayjs_plugin_advancedFormat);
    dayjs.extend(dayjs_plugin_weekOfYear);
}

// ============================================
// GANTT CHART GLOBAL STATE
// ============================================

const GANTT = {
    // Configuration
    DAY_CELL_WIDTH: 40,
    WEEK_CELL_WIDTH: 80,
    MONTH_CELL_WIDTH: 120,
    ROW_HEIGHT: 48,

    // State
    currentScale: 'month',
    projectStartDate: null,
    projectEndDate: null,
    totalProjectUnits: 0,
    tasks: [],
    isDragging: false,
    currentTask: null,
    initialX: 0,
    initialLeft: 0,
    initialWidth: 0,
    dragMode: 'move', // 'move', 'resize-left', 'resize-right'

    // ============================================
    // HELPER: Get Scale Parameters
    // ============================================
    getScaleParams() {
        if (this.currentScale === 'week') {
            return {
                unit: 'week',
                width: this.WEEK_CELL_WIDTH,
                format: 'W',
                secondaryFormat: 'MMM D',
                groupUnit: 'month',
                groupFormat: 'MMMM YYYY',
            };
        } else if (this.currentScale === 'month') {
            return {
                unit: 'month',
                width: this.MONTH_CELL_WIDTH,
                format: 'MMM',
                secondaryFormat: 'YYYY',
                groupUnit: 'year',
                groupFormat: 'YYYY',
            };
        } else { // 'day'
            return {
                unit: 'day',
                width: this.DAY_CELL_WIDTH,
                format: 'D',
                secondaryFormat: 'ddd',
                groupUnit: 'month',
                groupFormat: 'MMM YYYY',
            };
        }
    },

    // ============================================
    // HELPER: Calculate Task Duration in Days
    // ============================================
    getTaskDurationDays(start, end) {
        const startDay = dayjs(start);
        const endDay = dayjs(end);
        return endDay.diff(startDay, 'day') + 1;
    },

    // ============================================
    // CORE: Calculate Project Timeline Range
    // ============================================
    calculateProjectRange() {
        let minDate = dayjs();
        let maxDate = dayjs().add(10, 'day');
        const params = this.getScaleParams();

        if (this.tasks.length > 0) {
            const startTimestamps = this.tasks
                .filter(t => t.startDate || t.start)
                .map(t => dayjs(t.startDate || t.start).valueOf());
            const endTimestamps = this.tasks
                .filter(t => t.endDate || t.end)
                .map(t => dayjs(t.endDate || t.end).valueOf());

            if (startTimestamps.length > 0) {
                minDate = dayjs(Math.min(...startTimestamps));
            }
            if (endTimestamps.length > 0) {
                maxDate = dayjs(Math.max(...endTimestamps));
            }
        }

        // Pad the range
        this.projectStartDate = minDate.subtract(5, params.unit).startOf(params.unit);
        this.projectEndDate = maxDate.add(5, params.unit).endOf(params.unit);

        // Calculate total units
        let units = this.projectEndDate.diff(this.projectStartDate, params.unit, true);
        this.totalProjectUnits = Math.ceil(units) + 1;
    },

    // ============================================
    // RENDER: Task List (Left Panel)
    // ============================================
    renderTaskList() {
        const listBody = document.getElementById('task-list-body');
        if (!listBody) return;

        listBody.innerHTML = '';
        this.tasks.forEach((task, index) => {
            const row = document.createElement('div');
            row.id = `task-row-${task.id}`;
            row.className = `gantt-row flex items-center px-4 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`;
            row.innerHTML = `<span class="text-sm truncate">${task.name}</span>`;
            listBody.appendChild(row);
        });
    },

    // ============================================
    // RENDER: Timeline Header
    // ============================================
    renderTimelineHeader() {
        const headerContainer = document.getElementById('timeline-header');
        if (!headerContainer) return;

        headerContainer.innerHTML = '';
        const params = this.getScaleParams();
        const { unit, width, format, secondaryFormat, groupFormat, groupUnit } = params;
        const totalWidthPx = this.totalProjectUnits * width;

        // Build grouping map
        const headerGroups = new Map();
        for (let i = 0; i < this.totalProjectUnits; i++) {
            const date = this.projectStartDate.clone().add(i, unit);
            const groupingLabel = date.format(groupFormat);

            if (!headerGroups.has(groupingLabel)) {
                headerGroups.set(groupingLabel, { count: 0, label: groupingLabel });
            }
            headerGroups.get(groupingLabel).count++;
        }

        // Render top header (groups)
        const groupBar = document.createElement('div');
        groupBar.className = 'flex border-b border-gray-300';
        groupBar.style.width = `${totalWidthPx}px`;

        headerGroups.forEach(data => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'text-center font-bold text-sm text-gray-700 py-1 border-r border-gray-300 truncate';
            groupDiv.style.width = `${data.count * width}px`;
            groupDiv.textContent = data.label;
            groupBar.appendChild(groupDiv);
        });
        headerContainer.appendChild(groupBar);

        // Render bottom header (units)
        const unitBar = document.createElement('div');
        unitBar.className = 'flex';
        unitBar.style.width = `${totalWidthPx}px`;

        for (let i = 0; i < this.totalProjectUnits; i++) {
            const date = this.projectStartDate.clone().add(i, unit);
            let unitLabel = unit === 'week' ? `W${date.week()}` : date.format(format);
            let secondaryLabel = date.format(secondaryFormat);
            let cellClasses = 'bg-white text-gray-800';

            if (unit === 'day') {
                secondaryLabel = secondaryLabel.charAt(0);
                const isWeekend = date.day() === 0 || date.day() === 6;
                if (isWeekend) cellClasses = 'bg-gray-200/50 text-gray-400';
            } else if (unit === 'week') {
                secondaryLabel = `${date.format('MMM D')} - ${date.clone().add(6, 'day').format('D')}`;
            }

            unitBar.innerHTML += `
                <div class="gantt-cell text-center text-xs flex flex-col justify-center items-center p-0 border-r border-gray-200 ${cellClasses}" style="width: ${width}px;">
                    <span class="font-semibold">${unitLabel}</span>
                    <span class="text-gray-500">${secondaryLabel}</span>
                </div>
            `;
        }
        headerContainer.appendChild(unitBar);
    },

    // ============================================
    // RENDER: Gantt Grid and Today Line
    // ============================================
    renderGanttGrid() {
        const gridContainer = document.getElementById('gantt-grid');
        const todayLineContainer = document.getElementById('today-line-container');
        if (!gridContainer) return;

        gridContainer.innerHTML = '';
        if (todayLineContainer) todayLineContainer.innerHTML = '';

        const params = this.getScaleParams();
        const { unit, width, groupUnit } = params;
        const totalWidthPx = this.totalProjectUnits * width;

        const ganttContainer = document.getElementById('gantt-container');
        if (ganttContainer) {
            ganttContainer.style.width = `${totalWidthPx}px`;
        }

        // Draw vertical lines
        for (let i = 0; i <= this.totalProjectUnits; i++) {
            const date = this.projectStartDate.clone().add(i, unit);
            const isMajorLine = date.isSame(date.startOf(groupUnit), unit);

            let cellClasses = '';
            if (unit === 'day' && (date.day() === 0 || date.day() === 6)) {
                cellClasses = 'bg-gray-200/50';
            } else if (i % 2 !== 0 && unit !== 'day') {
                cellClasses = 'bg-gray-50/50';
            }

            const line = document.createElement('div');
            line.className = `absolute top-0 bottom-0 border-l ${isMajorLine ? 'border-gray-400' : 'border-gray-200'} ${cellClasses}`;
            line.style.left = `${i * width}px`;
            line.style.width = `${width}px`;
            gridContainer.appendChild(line);
        }

        // Draw today line
        const today = dayjs().startOf('day');
        if (today.isBetween(this.projectStartDate, this.projectEndDate.add(1, 'day'), 'day', '[)')) {
            let leftPos = 0;

            if (unit === 'day') {
                const daysFromStart = today.diff(this.projectStartDate, 'day');
                leftPos = daysFromStart * width + (width / 2);
            } else {
                const unitIndex = today.diff(this.projectStartDate.startOf(unit), unit);
                const dayIndexInUnit = today.diff(today.startOf(unit), 'day');
                const daysInUnit = unit === 'week' ? 7 : today.daysInMonth();
                leftPos = unitIndex * width + (dayIndexInUnit / daysInUnit) * width;
            }

            const todayLine = document.createElement('div');
            todayLine.className = 'today-line';
            todayLine.style.left = `${leftPos}px`;
            if (todayLineContainer) todayLineContainer.appendChild(todayLine);
        }

        // Draw horizontal lines
        for (let i = 0; i < this.tasks.length; i++) {
            const rowLine = document.createElement('div');
            rowLine.className = 'absolute left-0 right-0 border-b border-gray-100';
            rowLine.style.top = `${i * this.ROW_HEIGHT}px`;
            rowLine.style.height = `${this.ROW_HEIGHT}px`;
            gridContainer.appendChild(rowLine);
        }
    },

    // ============================================
    // RENDER: Task Bars with Drag & Resize
    // ============================================
    renderGanttBars() {
        const barsContainer = document.getElementById('gantt-bars');
        if (!barsContainer) return;

        barsContainer.innerHTML = '';
        const params = this.getScaleParams();
        const { unit, width } = params;

        this.tasks.forEach((task, index) => {
            const startDate = task.startDate || task.start;
            const endDate = task.endDate || task.end;
            if (!startDate || !endDate) return;

            const taskStart = dayjs(startDate).startOf('day');
            const taskEnd = dayjs(endDate).endOf('day');

            // Calculate position and width
            const unitsFromStart = taskStart.diff(this.projectStartDate, unit, true);
            const leftPosition = unitsFromStart * width;

            const durationDays = this.getTaskDurationDays(startDate, endDate);
            let durationUnits;

            if (unit === 'day') {
                durationUnits = durationDays;
            } else if (unit === 'week') {
                durationUnits = durationDays / 7;
            } else if (unit === 'month') {
                durationUnits = taskEnd.diff(taskStart.startOf('day'), 'month', true);
            }

            const barWidth = durationUnits * width;
            const bar = document.createElement('div');
            bar.id = `task-bar-${task.id}`;
            bar.className = `task-bar ${task.color || 'bg-blue-500'} shadow-lg hover:shadow-xl transition-shadow text-white text-xs font-medium`;
            bar.dataset.taskId = task.id;
            bar.dataset.taskIndex = index;
            bar.style.width = `${barWidth}px`;
            bar.style.left = `${leftPosition}px`;
            bar.style.top = `${index * this.ROW_HEIGHT + 10}px`;

            bar.innerHTML = `
                <div class="resize-handle resize-handle-left" data-mode="resize-left" title="Drag to adjust start date"></div>
                <div class="truncate flex items-center w-full h-full relative z-10 p-2 pointer-events-none">
                    <span>${task.name}</span>
                    <div class="ml-auto text-white bg-black/20 px-1 rounded-full">${task.progress || 0}%</div>
                </div>
                <div style="width: ${task.progress || 0}%;" class="absolute left-0 top-0 h-full ${task.color || 'bg-blue-500'} bg-opacity-70 rounded-l-md transition-all pointer-events-none"></div>
                <div class="resize-handle resize-handle-right" data-mode="resize-right" title="Drag to adjust end date"></div>
            `;

            barsContainer.appendChild(bar);

            // Add drag listeners
            bar.addEventListener('mousedown', (e) => this.handleDragStart(e));
            bar.addEventListener('touchstart', (e) => this.handleDragStart(e));
        });
    },

    // ============================================
    // DRAG & DROP: Handle Drag Start
    // ============================================
    handleDragStart(e) {
        e.preventDefault();

        const targetMode = e.target.dataset.mode;
        const bar = e.currentTarget;
        const taskId = bar.dataset.taskId;

        this.currentTask = this.tasks.find(t => t.id === taskId);
        if (!this.currentTask) return;

        this.dragMode = targetMode || 'move';
        this.isDragging = true;

        bar.style.cursor = this.dragMode === 'move' ? 'grabbing' : 'col-resize';
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        this.initialX = clientX;
        this.initialLeft = parseFloat(bar.style.left);
        this.initialWidth = parseFloat(bar.style.width);

        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('mouseup', (e) => this.handleDragEnd(e));
        document.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleDragEnd(e));
    },

    // ============================================
    // DRAG & DROP: Handle Drag Move
    // ============================================
    handleDragMove(e) {
        if (!this.isDragging || !this.currentTask) return;
        e.preventDefault();

        const bar = document.getElementById(`task-bar-${this.currentTask.id}`);
        if (!bar) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const dx = clientX - this.initialX;
        const params = this.getScaleParams();
        const snapSize = params.width;
        const totalProjectWidth = this.totalProjectUnits * snapSize;

        if (this.dragMode === 'move') {
            const newLeftPx = this.initialLeft + dx;
            const snappedLeftPx = Math.round(newLeftPx / snapSize) * snapSize;
            const maxBarWidth = parseFloat(bar.style.width);
            const maxLeft = totalProjectWidth - maxBarWidth;
            const finalLeft = Math.max(0, Math.min(maxLeft, snappedLeftPx));
            bar.style.left = `${finalLeft}px`;
        } else if (this.dragMode === 'resize-right') {
            const newWidth = this.initialWidth + dx;
            const snappedWidth = Math.max(snapSize, Math.round(newWidth / snapSize) * snapSize);
            const currentLeft = parseFloat(bar.style.left);
            const limitedWidth = Math.min(snappedWidth, totalProjectWidth - currentLeft);
            bar.style.width = `${limitedWidth}px`;
        } else if (this.dragMode === 'resize-left') {
            const newLeftPx = this.initialLeft + dx;
            const snappedLeftPx = Math.max(0, Math.round(newLeftPx / snapSize) * snapSize);
            const fixedRight = this.initialLeft + this.initialWidth;
            let newWidth = fixedRight - snappedLeftPx;

            if (newWidth < snapSize) {
                newWidth = snapSize;
                const minLeft = fixedRight - snapSize;
                bar.style.left = `${minLeft}px`;
            } else {
                bar.style.left = `${snappedLeftPx}px`;
            }
            bar.style.width = `${newWidth}px`;
        }
    },

    // ============================================
    // DRAG & DROP: Handle Drag End
    // ============================================
    handleDragEnd(e) {
        if (!this.isDragging || !this.currentTask) return;

        const bar = document.getElementById(`task-bar-${this.currentTask.id}`);
        if (bar) bar.style.cursor = 'grab';

        const params = this.getScaleParams();
        const { unit, width } = params;

        const finalLeftPx = parseFloat(bar.style.left);
        const finalWidthPx = parseFloat(bar.style.width);

        // Calculate new dates
        const unitIndexStart = Math.round(finalLeftPx / width);
        const newStartDate = this.projectStartDate.clone().add(unitIndexStart, unit).startOf('day');

        const unitDuration = Math.max(1, Math.round(finalWidthPx / width));
        let durationInDays;

        if (unit === 'day') {
            durationInDays = unitDuration;
        } else if (unit === 'week') {
            durationInDays = unitDuration * 7;
        } else if (unit === 'month') {
            const newEndUnitDate = newStartDate.clone().add(unitDuration, unit);
            durationInDays = newEndUnitDate.diff(newStartDate, 'day');
        }

        const newEndDate = newStartDate.clone().add(durationInDays, 'day').subtract(1, 'day').startOf('day');

        // Update task data
        this.currentTask.start = newStartDate.format('YYYY-MM-DD');
        this.currentTask.end = newEndDate.format('YYYY-MM-DD');
        this.currentTask.startDate = this.currentTask.start;
        this.currentTask.endDate = this.currentTask.end;

        // TODO: Update Firebase with new dates
        console.log(`Task ${this.currentTask.id} moved/resized. New Start: ${this.currentTask.start}, New End: ${this.currentTask.end}`);

        // Re-render
        this.renderGanttBars();

        this.isDragging = false;
        this.currentTask = null;
        this.dragMode = 'move';

        document.removeEventListener('mousemove', (e) => this.handleDragMove(e));
        document.removeEventListener('mouseup', (e) => this.handleDragEnd(e));
        document.removeEventListener('touchmove', (e) => this.handleDragMove(e));
        document.removeEventListener('touchend', (e) => this.handleDragEnd(e));
    },

    // ============================================
    // RENDER: Main Gantt Chart
    // ============================================
    renderChart(projects) {
        // Convert project data to task format
        this.tasks = projects.map(p => ({
            id: p.id || p.name,
            name: p.name,
            start: p.startDate,
            end: p.endDate,
            startDate: p.startDate,
            endDate: p.endDate,
            progress: p.progress || 0,
            color: this.getTaskColor(p),
        }));

        // Calculate timeline range
        this.calculateProjectRange();

        // Render all components
        this.renderTaskList();
        this.renderTimelineHeader();
        this.renderGanttGrid();
        this.renderGanttBars();

        // Sync scrolling
        const header = document.getElementById('timeline-header');
        const container = document.getElementById('gantt-container');

        if (header && container) {
            header.style.overflowY = 'hidden';
            container.onscroll = () => {
                header.scrollLeft = container.scrollLeft;
            };

            // Scroll to today
            const today = dayjs().startOf('day');
            const params = this.getScaleParams();
            const daysFromStart = today.diff(this.projectStartDate, 'day');
            let scrollPosition = 0;

            if (params.unit === 'day') {
                scrollPosition = Math.max(0, (daysFromStart * params.width) - (params.width * 5));
            } else {
                const unitIndex = today.diff(this.projectStartDate.startOf(params.unit), params.unit);
                scrollPosition = Math.max(0, (unitIndex * params.width) - (params.width * 2));
            }

            setTimeout(() => {
                container.scrollLeft = scrollPosition;
            }, 50);
        }

        console.log(`Gantt Chart Rendered. Scale: ${this.currentScale}. Total Units: ${this.totalProjectUnits}`);
    },

    // ============================================
    // HELPER: Get Task Color
    // ============================================
    getTaskColor(project) {
        // Map project health to color
        if (project.projectHealth === 'green') return 'bg-green-500';
        if (project.projectHealth === 'amber') return 'bg-yellow-500';
        if (project.projectHealth === 'red') return 'bg-red-500';
        return 'bg-blue-500';
    },

    // ============================================
    // PUBLIC: Set Timeline Scale
    // ============================================
    setScale(scale) {
        this.currentScale = scale;
        if (this.tasks.length > 0) {
            this.calculateProjectRange();
            this.renderTimelineHeader();
            this.renderGanttGrid();
            this.renderGanttBars();
        }
    },
};

// ============================================
// EXPORT FOR GLOBAL USE
// ============================================
window.GANTT = GANTT;
