/**
 * Enhanced Web Viewer for Anamalia Prompt Assembler
 * Provides advanced functionality for browsing, filtering, and comparing renders
 */

class AnamaliaViewer {
    constructor() {
        this.renders = [];
        this.filteredRenders = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.comparisonMode = false;
        this.selectedForComparison = [];
        
        this.init();
    }
    
    async init() {
        console.log('🎨 Initializing Anamalia Web Viewer...');
        
        // Load renders data
        await this.loadRenders();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial render
        this.render();
        
        console.log(`✅ Loaded ${this.renders.length} renders`);
    }
    
    async loadRenders() {
        try {
            // In a real implementation, this would load from the server
            // For now, we'll simulate with the existing bundles
            this.renders = await this.simulateRenders();
        } catch (error) {
            console.error('Error loading renders:', error);
            this.showError('Failed to load renders. Please check the server connection.');
        }
    }
    
    async simulateRenders() {
        // Simulate loading renders from bundles directory
        const mockRenders = [
            {
                id: 'bundle_001',
                title: 'Ruby Rhino - Welcome Pose',
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFBsYWNlaG9sZGVyPC90ZXh0Pjwvc3ZnPg==',
                metadata: {
                    character: 'ruby_rhino',
                    pose: 'arms_open_welcome',
                    scene: 'piazza_v2',
                    lighting: 'lighting_001',
                    film_type: 'stop_motion',
                    texture: 'texture_001',
                    camera: 'camera_001',
                    model: 't2i_model_x@0.9',
                    wardrobe: ['sunhat'],
                    props: [],
                    film_bible: 'film_bible@1.0.0',
                    vocabulary_version: 'lexicon@v1',
                    bundle_type: 'standard',
                    created_at: '2025-10-23T14:02:49.000Z',
                    status: 'completed',
                    approved: false
                },
                tags: ['rhino', 'welcome', 'piazza', 'golden-hour'],
                prompt: 'A rhino named Ruby in a welcoming pose at a miniature cobblestone piazza...'
            },
            {
                id: 'bundle_002',
                title: 'Maxine Mouse - Seated',
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFBsYWNlaG9sZGVyPC90ZXh0Pjwvc3ZnPg==',
                metadata: {
                    character: 'maxine_mouse',
                    pose: 'seated_contemplative',
                    scene: 'library_v1',
                    lighting: 'lighting_002',
                    film_type: 'claymation',
                    texture: 'texture_009',
                    camera: 'camera_005',
                    model: 't2i_model_x@0.9',
                    wardrobe: [],
                    props: ['book'],
                    film_bible: 'film_bible@1.0.0',
                    vocabulary_version: 'lexicon@v1',
                    bundle_type: 'tenner_chunk',
                    created_at: '2025-10-23T14:05:12.000Z',
                    status: 'completed',
                    approved: true
                },
                tags: ['mouse', 'seated', 'library', 'indoor'],
                prompt: 'A mouse named Maxine in a contemplative seated pose in a cozy library...'
            },
            {
                id: 'bundle_003',
                title: 'Sammy Sloth - Musical Performance',
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFBsYWNlaG9sZGVyPC90ZXh0Pjwvc3ZnPg==',
                metadata: {
                    character: 'sammy_sloth',
                    pose: 'standing_confident',
                    scene: 'garden_v1',
                    lighting: 'lighting_003',
                    film_type: 'puppet_animation',
                    texture: 'texture_008',
                    camera: 'camera_003',
                    model: 'stable_diffusion_xl',
                    wardrobe: ['cowboy_hat'],
                    props: ['musical_instrument'],
                    film_bible: 'film_bible@1.1.0',
                    vocabulary_version: 'lexicon@v2',
                    bundle_type: 'individual_tenner',
                    created_at: '2025-10-23T15:30:45.000Z',
                    status: 'pending',
                    approved: false
                },
                tags: ['sloth', 'musical', 'garden', 'dramatic'],
                prompt: 'A sloth named Sammy performing with a musical instrument in a garden setting...'
            },
            {
                id: 'bundle_004',
                title: 'Tenner Chunk - House Construction',
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFBsYWNlaG9sZGVyPC90ZXh0Pjwvc3ZnPg==',
                metadata: {
                    character: 'ruby_rhino',
                    pose: 'arms_open_welcome',
                    scene: 'piazza_v2',
                    lighting: 'lighting_004',
                    film_type: 'miniature',
                    texture: 'texture_005',
                    camera: 'camera_010',
                    model: 'dalle_3',
                    wardrobe: ['spectacles'],
                    props: ['teacup'],
                    film_bible: 'film_bible@2.0.0',
                    vocabulary_version: 'lexicon@2025-10-23',
                    bundle_type: 'matrix_generated',
                    created_at: '2025-10-24T00:15:30.000Z',
                    status: 'failed',
                    approved: false
                },
                tags: ['tenner', 'chunk', 'house', 'construction'],
                prompt: 'House made of jelly-beans and gum with Ruby Rhino wearing spectacles...'
            }
        ];
        
        return mockRenders;
    }
    
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterRenders();
            });
        }
        
        // Filter dropdowns
        const filterSelects = document.querySelectorAll('.filter-group select');
        filterSelects.forEach(select => {
            select.addEventListener('change', () => {
                this.filterRenders();
            });
        });
        
        // Comparison mode
        const compareBtn = document.getElementById('compare-btn');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                this.toggleComparisonMode();
            });
        }
        
        // Close comparison mode
        const closeBtn = document.getElementById('close-comparison');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeComparisonMode();
            });
        }
        
        // Pagination
        const pagination = document.getElementById('pagination');
        if (pagination) {
            pagination.addEventListener('click', (e) => {
                if (e.target.classList.contains('page-btn')) {
                    const page = parseInt(e.target.dataset.page);
                    this.goToPage(page);
                }
            });
        }
        
        // Mode toggle
        const assembleModeBtn = document.getElementById('assemble-mode-btn');
        const browseModeBtn = document.getElementById('browse-mode-btn');
        
        if (assembleModeBtn) {
            assembleModeBtn.addEventListener('click', () => this.switchToAssembleMode());
        }
        
        if (browseModeBtn) {
            browseModeBtn.addEventListener('click', () => this.switchToBrowseMode());
        }
        
        // Assemble mode functionality
        const generateBundlesBtn = document.getElementById('generate-bundles-btn');
        const previewPromptBtn = document.getElementById('preview-prompt-btn');
        
        if (generateBundlesBtn) {
            generateBundlesBtn.addEventListener('click', () => this.generateBundles());
        }
        
        if (previewPromptBtn) {
            previewPromptBtn.addEventListener('click', () => this.previewPrompt());
        }
    }
    
    filterRenders() {
        const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
        const characterFilter = document.getElementById('character-filter')?.value || 'all';
        const poseFilter = document.getElementById('pose-filter')?.value || 'all';
        const sceneFilter = document.getElementById('scene-filter')?.value || 'all';
        const lightingFilter = document.getElementById('lighting-filter')?.value || 'all';
        const filmTypeFilter = document.getElementById('film-type-filter')?.value || 'all';
        const textureFilter = document.getElementById('texture-filter')?.value || 'all';
        const cameraFilter = document.getElementById('camera-filter')?.value || 'all';
        const wardrobeFilter = document.getElementById('wardrobe-filter')?.value || 'all';
        const propsFilter = document.getElementById('props-filter')?.value || 'all';
        const modelFilter = document.getElementById('model-filter')?.value || 'all';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const filmBibleFilter = document.getElementById('film-bible-filter')?.value || 'all';
        const vocabularyFilter = document.getElementById('vocabulary-filter')?.value || 'all';
        const bundleTypeFilter = document.getElementById('bundle-type-filter')?.value || 'all';
        const dateRangeFilter = document.getElementById('date-range-filter')?.value || 'all';
        
        this.filteredRenders = this.renders.filter(render => {
            // Search filter
            if (searchTerm && !render.title.toLowerCase().includes(searchTerm) && 
                !render.prompt.toLowerCase().includes(searchTerm)) {
                return false;
            }
            
            // Character filter
            if (characterFilter !== 'all' && render.metadata.character !== characterFilter) {
                return false;
            }
            
            // Pose filter
            if (poseFilter !== 'all' && render.metadata.pose !== poseFilter) {
                return false;
            }
            
            // Scene filter
            if (sceneFilter !== 'all' && render.metadata.scene !== sceneFilter) {
                return false;
            }
            
            // Lighting filter
            if (lightingFilter !== 'all' && render.metadata.lighting !== lightingFilter) {
                return false;
            }
            
            // Film type filter
            if (filmTypeFilter !== 'all' && render.metadata.film_type !== filmTypeFilter) {
                return false;
            }
            
            // Texture filter
            if (textureFilter !== 'all' && render.metadata.texture !== textureFilter) {
                return false;
            }
            
            // Camera filter
            if (cameraFilter !== 'all' && render.metadata.camera !== cameraFilter) {
                return false;
            }
            
            // Wardrobe filter
            if (wardrobeFilter !== 'all') {
                if (wardrobeFilter === 'none' && render.metadata.wardrobe && render.metadata.wardrobe.length > 0) {
                    return false;
                } else if (wardrobeFilter !== 'none' && (!render.metadata.wardrobe || !render.metadata.wardrobe.includes(wardrobeFilter))) {
                    return false;
                }
            }
            
            // Props filter
            if (propsFilter !== 'all') {
                if (propsFilter === 'none' && render.metadata.props && render.metadata.props.length > 0) {
                    return false;
                } else if (propsFilter !== 'none' && (!render.metadata.props || !render.metadata.props.includes(propsFilter))) {
                    return false;
                }
            }
            
            // Model filter
            if (modelFilter !== 'all' && render.metadata.model !== modelFilter) {
                return false;
            }
            
            // Status filter
            if (statusFilter !== 'all' && render.metadata.status !== statusFilter) {
                return false;
            }
            
            // Film Bible filter
            if (filmBibleFilter !== 'all' && render.metadata.film_bible !== filmBibleFilter) {
                return false;
            }
            
            // Vocabulary filter
            if (vocabularyFilter !== 'all' && render.metadata.vocabulary_version !== vocabularyFilter) {
                return false;
            }
            
            // Bundle type filter
            if (bundleTypeFilter !== 'all' && render.metadata.bundle_type !== bundleTypeFilter) {
                return false;
            }
            
            // Date range filter
            if (dateRangeFilter !== 'all') {
                const renderDate = new Date(render.metadata.created_at);
                const now = new Date();
                
                switch (dateRangeFilter) {
                    case 'today':
                        if (renderDate.toDateString() !== now.toDateString()) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (renderDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        if (renderDate < monthAgo) return false;
                        break;
                }
            }
            
            return true;
        });
        
        this.currentPage = 1;
        this.render();
        this.updateStats();
    }
    
    render() {
        this.renderStats();
        this.renderGallery();
        this.renderPagination();
    }
    
    renderStats() {
        const statsContainer = document.getElementById('stats');
        if (!statsContainer) return;
        
        const totalRenders = this.renders.length;
        const filteredCount = this.filteredRenders.length;
        const approvedCount = this.renders.filter(r => r.metadata.approved).length;
        const pendingCount = this.renders.filter(r => r.metadata.status === 'pending').length;
        
        statsContainer.innerHTML = `
            <div class="stat-item">Total: ${totalRenders}</div>
            <div class="stat-item">Filtered: ${filteredCount}</div>
            <div class="stat-item">Approved: ${approvedCount}</div>
            <div class="stat-item">Pending: ${pendingCount}</div>
        `;
    }
    
    renderGallery() {
        const gallery = document.getElementById('gallery');
        if (!gallery) return;
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageRenders = this.filteredRenders.slice(startIndex, endIndex);
        
        if (pageRenders.length === 0) {
            gallery.innerHTML = `
                <div class="no-results">
                    <h3>No renders found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }
        
        gallery.innerHTML = pageRenders.map(render => this.renderCard(render)).join('');
    }
    
    renderCard(render) {
        const statusClass = render.metadata.approved ? 'approved' : 'pending';
        const statusIcon = render.metadata.approved ? '✅' : '⏳';
        
        return `
            <div class="render-card" data-render-id="${render.id}">
                <div class="render-image">
                    <img src="${render.image}" alt="${render.title}" loading="lazy">
                </div>
                <div class="render-info">
                    <div class="render-title">${render.title}</div>
                    <div class="render-meta">
                        ${statusIcon} ${render.metadata.status} • 
                        ${new Date(render.metadata.created_at).toLocaleDateString()}<br>
                        <small>
                            Lighting: ${render.metadata.lighting} • 
                            Film: ${render.metadata.film_type} • 
                            Texture: ${render.metadata.texture} • 
                            Camera: ${render.metadata.camera} • 
                            Model: ${render.metadata.model}<br>
                            ${render.metadata.wardrobe.length > 0 ? `Wardrobe: ${render.metadata.wardrobe.join(', ')} • ` : ''}
                            ${render.metadata.props.length > 0 ? `Props: ${render.metadata.props.join(', ')}` : 'No props'}
                        </small>
                    </div>
                    <div class="render-tags">
                        ${render.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="render-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewer.viewRender('${render.id}')">
                            👁️ View
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="viewer.toggleComparison('${render.id}')">
                            🔍 Compare
                        </button>
                        <button class="btn btn-sm ${render.metadata.approved ? 'btn-danger' : 'btn-success'}" 
                                onclick="viewer.toggleApproval('${render.id}')">
                            ${render.metadata.approved ? '❌ Reject' : '✅ Approve'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        const totalPages = Math.ceil(this.filteredRenders.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="page-btn" data-page="${this.currentPage - 1}" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                ← Previous
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<span>...</span>`;
            }
        }
        
        // Next button
        paginationHTML += `
            <button class="page-btn" data-page="${this.currentPage + 1}" 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                Next →
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }
    
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredRenders.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
        }
    }
    
    viewRender(renderId) {
        const render = this.renders.find(r => r.id === renderId);
        if (!render) return;
        
        // In a real implementation, this would open a detailed view modal
        alert(`Viewing render: ${render.title}\n\nPrompt: ${render.prompt}`);
    }
    
    toggleComparison(renderId) {
        const index = this.selectedForComparison.indexOf(renderId);
        if (index > -1) {
            this.selectedForComparison.splice(index, 1);
        } else {
            this.selectedForComparison.push(renderId);
        }
        
        this.updateComparisonButton();
    }
    
    updateComparisonButton() {
        const compareBtn = document.getElementById('compare-btn');
        if (compareBtn) {
            compareBtn.textContent = `🔍 Compare (${this.selectedForComparison.length})`;
            compareBtn.disabled = this.selectedForComparison.length < 2;
        }
    }
    
    toggleComparisonMode() {
        if (this.selectedForComparison.length < 2) {
            alert('Please select at least 2 renders to compare.');
            return;
        }
        
        this.comparisonMode = true;
        this.renderComparison();
    }
    
    closeComparisonMode() {
        this.comparisonMode = false;
        this.selectedForComparison = [];
        this.updateComparisonButton();
        document.getElementById('comparison-mode').style.display = 'none';
    }
    
    renderComparison() {
        const comparisonMode = document.getElementById('comparison-mode');
        if (!comparisonMode) return;
        
        const selectedRenders = this.renders.filter(r => 
            this.selectedForComparison.includes(r.id)
        );
        
        comparisonMode.style.display = 'flex';
        comparisonMode.innerHTML = `
            <div class="comparison-content">
                <div class="comparison-header">
                    <h3>Comparing ${selectedRenders.length} Renders</h3>
                    <button id="close-comparison" class="close-btn">×</button>
                </div>
                <div class="comparison-body">
                    ${selectedRenders.map(render => `
                        <div class="render-card">
                            <div class="render-image">
                                <img src="${render.image}" alt="${render.title}">
                            </div>
                            <div class="render-info">
                                <div class="render-title">${render.title}</div>
                                <div class="render-meta">
                                    Character: ${render.metadata.character}<br>
                                    Pose: ${render.metadata.pose}<br>
                                    Scene: ${render.metadata.scene}<br>
                                    Status: ${render.metadata.status}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Re-attach event listener for close button
        document.getElementById('close-comparison').addEventListener('click', () => {
            this.closeComparisonMode();
        });
    }
    
    toggleApproval(renderId) {
        const render = this.renders.find(r => r.id === renderId);
        if (!render) return;
        
        render.metadata.approved = !render.metadata.approved;
        this.render();
        this.updateStats();
        
        console.log(`Render ${renderId} ${render.metadata.approved ? 'approved' : 'rejected'}`);
    }
    
    updateStats() {
        this.renderStats();
    }
    
    // Mode switching methods
    switchToAssembleMode() {
        document.getElementById('assemble-mode-btn').classList.add('active');
        document.getElementById('browse-mode-btn').classList.remove('active');
        document.getElementById('assemble-mode').style.display = 'block';
        document.getElementById('browse-mode').style.display = 'none';
        document.querySelector('.filters').style.display = 'none';
        
        // Smooth scroll to assemble mode section
        setTimeout(() => {
            document.getElementById('assemble-mode').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }
    
    switchToBrowseMode() {
        document.getElementById('browse-mode-btn').classList.add('active');
        document.getElementById('assemble-mode-btn').classList.remove('active');
        document.getElementById('browse-mode').style.display = 'block';
        document.getElementById('assemble-mode').style.display = 'none';
        document.querySelector('.filters').style.display = 'block';
        
        // Smooth scroll to browse mode section (filters)
        setTimeout(() => {
            document.querySelector('.filters').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }
    
    // Assemble mode methods
    generateBundles() {
        const assemblyType = document.querySelector('input[name="assembly-type"]:checked').value;
        const character = document.getElementById('assemble-character').value;
        const pose = document.getElementById('assemble-pose').value;
        const scene = document.getElementById('assemble-scene').value;
        const lighting = document.getElementById('assemble-lighting').value;
        const wardrobe = document.getElementById('assemble-wardrobe').value;
        const props = document.getElementById('assemble-props').value;
        const count = document.getElementById('assemble-count').value;
        const outputDir = document.getElementById('assemble-output').value;
        const verbose = document.getElementById('assemble-verbose').checked;
        
        // Show results section
        const resultsDiv = document.getElementById('assemble-results');
        resultsDiv.style.display = 'block';
        
        // Simulate bundle generation
        const outputLog = document.getElementById('assemble-output-log');
        let logContent = `🚀 Generating ${count} bundle(s) using ${assemblyType} assembly...\n\n`;
        
        if (assemblyType === 'standard') {
            logContent += `📋 Standard Bundle Configuration:\n`;
            logContent += `   Character: ${character}\n`;
            logContent += `   Pose: ${pose}\n`;
            logContent += `   Scene: ${scene}\n`;
            logContent += `   Lighting: ${lighting}\n`;
            logContent += `   Wardrobe: ${wardrobe}\n`;
            logContent += `   Props: ${props}\n\n`;
        } else if (assemblyType === 'tenner-chunk') {
            logContent += `🎯 Tenner Chunk Assembly:\n`;
            logContent += `   Generating combinations from chunk definitions...\n\n`;
        } else if (assemblyType === 'individual-tenner') {
            logContent += `🔢 Individual Tenner Generation:\n`;
            logContent += `   Processing unchunked Tenners...\n\n`;
        } else if (assemblyType === 'matrix') {
            logContent += `📊 Matrix Generation:\n`;
            logContent += `   Creating cartesian product combinations...\n\n`;
        }
        
        logContent += `⚙️ Settings:\n`;
        logContent += `   Output Directory: ${outputDir}\n`;
        logContent += `   Verbose: ${verbose ? 'Yes' : 'No'}\n\n`;
        
        logContent += `✅ Bundle generation complete!\n`;
        logContent += `📁 Files saved to: ${outputDir}/\n`;
        logContent += `📊 Generated ${count} bundle(s) successfully\n`;
        
        outputLog.textContent = logContent;
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    previewPrompt() {
        const character = document.getElementById('assemble-character').value;
        const pose = document.getElementById('assemble-pose').value;
        const scene = document.getElementById('assemble-scene').value;
        const lighting = document.getElementById('assemble-lighting').value;
        const filmType = document.getElementById('assemble-film-type').value;
        const texture = document.getElementById('assemble-texture').value;
        const camera = document.getElementById('assemble-camera').value;
        const wardrobe = document.getElementById('assemble-wardrobe').value;
        const props = document.getElementById('assemble-props').value;
        
        // Generate preview prompt
        let prompt = `A ${character.replace('_', ' ')} in a ${pose.replace('_', ' ')} pose`;
        
        if (scene !== 'all') {
            prompt += ` at a ${scene.replace('_', ' ')}`;
        }
        
        if (lighting !== 'all') {
            // Add detailed lighting phrase
            const lightingPhrases = {
                'lighting_001': 'Warm, directional late-afternoon sunlight from front-left at 45°, soft fill light from right, subtle floor shadow, gently contrasted stop-motion studio lighting',
                'lighting_002': 'Soft, even overhead lighting with 360° ambient fill, minimal shadows, warm tungsten tone, cozy stop-motion studio atmosphere',
                'lighting_003': 'Sharp, dramatic lighting from front-left at 30°, minimal back fill, defined shadows with high contrast, cinematic stop-motion studio lighting',
                'lighting_004': 'Clean, even overhead lighting with 360° fill, soft even shadows, neutral color temperature, professional stop-motion studio lighting',
                'lighting_005': 'Warm sunset backlight from back-right at 60°, soft warm fill from front, elongated soft shadows, golden hour stop-motion studio lighting',
                'lighting_006': 'Cool moonlight from front-left at 15°, minimal cool fill, soft defined shadows, blue-tinted stop-motion studio lighting',
                'lighting_007': 'Warm candlelight from front-left at 45°, soft warm ambient from below, flickering soft shadows, intimate stop-motion studio lighting',
                'lighting_008': 'Bright daylight from front-left at 30°, strong fill from right, moderate shadows, natural stop-motion studio lighting',
                'lighting_009': 'Diffused overcast lighting from overhead, 360° soft fill, minimal contrast, natural stop-motion studio lighting',
                'lighting_010': 'Warm firelight from front-left at 30°, soft warm ambient from below, dancing soft shadows, cozy stop-motion studio lighting'
            };
            
            if (lightingPhrases[lighting]) {
                prompt += ` with ${lightingPhrases[lighting]}`;
            } else {
                prompt += ` with ${lighting.replace('_', ' ')} lighting`;
            }
        }
        
        if (filmType !== 'all') {
            prompt += ` in ${filmType.replace('_', ' ')} style`;
        }
        
        // Add texture directive
        const texturePhrases = {
            'texture_001': 'Character crafted from finely felted wool with visible fiber texture, hyper-realistic eyes and nose with natural reflections, matte felted surfaces for body, slight specular highlights on eyes and nostrils',
            'texture_002': 'Photographed like a real miniature puppet under macro lens lighting, shallow depth of field, cinematic realism',
            'texture_003': 'Wardrobe items in natural fabrics with visible weave texture, soft drape, minimal specular highlights, matte fabric finish',
            'texture_004': 'Props crafted from aged wood with visible grain texture, weathered patina, warm wood reflections, hand-crafted finish',
            'texture_005': 'Ceramic items with smooth glaze finish, subtle hand-crafted imperfections, controlled specular highlights, authentic pottery feel',
            'texture_006': 'Metal hardware with aged patina, slight oxidation, authentic metallic reflections, weathered finish',
            'texture_007': 'Glass items with clear transparency, subtle light refraction, authentic glass reflections, crystal clarity',
            'texture_008': 'Leather items with natural grain texture, supple surface, authentic leather sheen, hand-tooled finish',
            'texture_009': 'Paper items with visible fiber texture, slight age yellowing, matte finish, authentic paper feel',
            'texture_010': 'Stone items with natural grain texture, mineral veining, authentic stone reflections, natural finish'
        };
        
        if (texture && texturePhrases[texture]) {
            prompt += `. ${texturePhrases[texture]}`;
        }
        
        if (wardrobe !== 'none') {
            prompt += ` wearing a ${wardrobe.replace('_', ' ')}`;
        }
        
        if (props !== 'none') {
            prompt += ` holding a ${props.replace('_', ' ')}`;
        }
        
        // Add camera system description
        const cameraDescriptions = {
            'camera_001': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height 1 meter, angled 0° downward, positioned at stage center',
            'camera_002': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height 0.75 meters, angled 5° downward, positioned at stage center',
            'camera_003': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height 0.5 meters, angled 10° upward, positioned at stage center',
            'camera_004': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height 1.5 meters, angled 5° downward, positioned at stage center',
            'camera_005': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height 1 meter, angled 0° downward, positioned at stage center, camera rotated 45° left',
            'camera_006': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height 1 meter, angled 0° downward, positioned at stage center, camera rotated 45° right',
            'camera_007': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height 1 meter, angled 0° downward, positioned at stage center, camera rotated 90° left',
            'camera_008': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height 1 meter, angled 0° downward, positioned at stage center, camera rotated 135° left',
            'camera_009': 'Captured on a miniature stop-motion stage using a fixed camera at 50mm lens, tripod height 1 meter, angled 0° downward, positioned at stage center',
            'camera_010': 'Captured on a miniature stop-motion stage using a fixed camera at 24mm lens, tripod height 1 meter, angled 0° downward, positioned at stage center'
        };
        
        if (camera && cameraDescriptions[camera]) {
            prompt += `. ${cameraDescriptions[camera]}`;
        }
        
        prompt += `, 3D stop-motion style, high quality, detailed`;
        
        // Show preview in alert or modal
        alert(`Preview Prompt:\n\n${prompt}`);
    }
    
    showError(message) {
        const container = document.querySelector('.container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = message;
            container.insertBefore(errorDiv, container.firstChild);
        }
    }
}

// Initialize the viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.viewer = new AnamaliaViewer();
});
