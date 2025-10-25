/**
 * Enhanced Web Viewer for Anamalia Prompt Assembler
 * Provides advanced functionality for browsing, filtering, and comparing renders
 * Cache-busting timestamp: 2025-01-24-13-00
 */

class AnamaliaViewer {
    constructor() {
        this.renders = [];
        this.filteredRenders = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.comparisonMode = false;
        this.selectedForComparison = [];
        this.tennerData = null;
        
        this.init();
    }
    
    async init() {
        console.log('🎨 Initializing Anamalia Web Viewer...');
        
        // Load renders data
        await this.loadRenders();
        
        // Load Tenner data from JSON file
        await this.loadTennerData();
        
        // Set up event listeners
        this.setupEventListeners();
        this.setupTennerListeners();
        this.setupInfoModalListeners();
        this.setupDocModalListeners();
        
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
                    pose: 'arms_open_welcome',
                    scene: 'piazza_v2',
                    lighting: 'lighting_001',
                    film_type: 'stop_motion',
                    texture: 'texture_001',
                    film_stock: 'kodak_portra_400',
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
                    film_stock: 'fuji_superia_400',
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
                    pose: 'standing_confident',
                    scene: 'garden_v1',
                    lighting: 'lighting_003',
                    film_type: 'puppet_animation',
                    texture: 'texture_008',
                    film_stock: 'ilford_hp5_400',
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
                    pose: 'arms_open_welcome',
                    scene: 'piazza_v2',
                    lighting: 'lighting_004',
                    film_type: 'miniature',
                    texture: 'texture_005',
                    film_stock: 'cinestill_800t',
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
    
    setupTennerListeners() {
        // Tenner mode toggle listener
        const modeRadios = document.querySelectorAll('input[name="tenner-mode"]');
        modeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateTennerMode();
            });
        });
        
        // Tenner dropdown listeners
        const tennerSelects = ['tenner-1', 'tenner-2', 'tenner-3'];
        
        tennerSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', () => {
                    this.updateTennerStatus();
                    this.updateTennerOptions();
                    this.updateTennerSpecificOptions();
                });
            }
        });
        
        // Specific option dropdown listeners
        const specificSelects = ['tenner-1-specific', 'tenner-2-specific', 'tenner-3-specific'];
        specificSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', () => {
                    this.updateTennerStatus();
                });
            }
        });
        
        // Tenner pose selection listener
        const tennerPoseSelect = document.getElementById('tenner-pose');
        if (tennerPoseSelect) {
            tennerPoseSelect.addEventListener('change', () => {
                this.updateCustomPoseVisibility();
            });
        }
    }
    
    updateTennerMode() {
        const mode = document.querySelector('input[name="tenner-mode"]:checked')?.value || 'batch';
        
        // Update status and options when mode changes
        this.updateTennerStatus();
        this.updateTennerOptions();
        this.updateTennerSpecificOptions();
        this.updateCharacterCategoryState();
    }
    
    updateTennerSpecificOptions() {
        const mode = document.querySelector('input[name="tenner-mode"]:checked')?.value || 'batch';
        
        if (mode === 'batch') {
            // Hide all specific option dropdowns in batch mode
            ['tenner-1-option', 'tenner-2-option', 'tenner-3-option'].forEach(divId => {
                const div = document.getElementById(divId);
                if (div) {
                    div.style.display = 'none';
                }
            });
            return;
        }
        
        // Check if Tenner data is available
        if (!this.tennerData || !this.tennerData.categories) {
            console.log('📊 No Tenner data available - UI will show empty dropdowns');
            console.log('📊 this.tennerData:', this.tennerData);
            return;
        }
        
        console.log('📊 Tenner data available:', Object.keys(this.tennerData.categories).length, 'categories');
        
        // Update each specific option dropdown
        ['tenner-1', 'tenner-2', 'tenner-3'].forEach((tennerId, index) => {
            const tennerSelect = document.getElementById(tennerId);
            const specificSelect = document.getElementById(`${tennerId}-specific`);
            const optionDiv = document.getElementById(`${tennerId}-option`);
            
            if (!tennerSelect || !specificSelect || !optionDiv) return;
            
            const selectedTenner = tennerSelect.value;
            console.log(`📊 Processing ${tennerId}: selectedTenner="${selectedTenner}", mode="${mode}"`);
            
            if (mode === 'single' && selectedTenner && selectedTenner !== 'none') {
                optionDiv.style.display = 'block';
                
                // Clear existing options
                specificSelect.innerHTML = '<option value="">Select specific option...</option>';
                
                // Get options from real data
                const options = this.tennerData.categories[selectedTenner];
                console.log(`📊 ${selectedTenner} data:`, options);
                
                if (options && options.length > 0) {
                    console.log(`📋 ${selectedTenner} options:`, options.length);
                    
                    // Populate with options for the selected Tenner
                    options.forEach(option => {
                        const optionText = `${selectedTenner}-${option.option_index}: ${option.descriptor}`;
                        const optionElement = document.createElement('option');
                        optionElement.value = optionText;
                        optionElement.textContent = optionText;
                        specificSelect.appendChild(optionElement);
                    });
                } else {
                    console.warn(`⚠️ No options found for ${selectedTenner}`);
                    console.log(`📊 Available categories:`, Object.keys(this.tennerData.categories));
                }
            } else {
                optionDiv.style.display = 'none';
                specificSelect.innerHTML = '<option value="">Select specific option...</option>';
            }
        });
    }    
    updateTennerStatus() {
        const mode = document.querySelector('input[name="tenner-mode"]:checked')?.value || 'batch';
        const tenner1 = document.getElementById('tenner-1')?.value || '';
        const tenner2 = document.getElementById('tenner-2')?.value || '';
        const tenner3 = document.getElementById('tenner-3')?.value || '';
        
        const selectedTenners = [tenner1, tenner2, tenner3].filter(t => t !== '' && t !== 'none');
        const statusElement = document.getElementById('tenner-status');
        const chunkIdDisplay = document.getElementById('chunk-id-display');
        const chunkIdValue = document.getElementById('chunk-id-value');
        
        if (!statusElement) return;
        
        if (mode === 'single') {
            // In single mode, show specific selections
            const specific1 = document.getElementById('tenner-1-specific')?.value || '';
            const specific2 = document.getElementById('tenner-2-specific')?.value || '';
            const specific3 = document.getElementById('tenner-3-specific')?.value || '';
            
            const selectedSpecifics = [specific1, specific2, specific3].filter(s => s !== '');
            
            if (selectedTenners.length === 0) {
                statusElement.textContent = 'Select Tenners to see combination count';
                statusElement.style.color = '#666';
                if (chunkIdDisplay) chunkIdDisplay.style.display = 'none';
            } else if (selectedSpecifics.length === 0) {
                statusElement.textContent = `Single mode: ${selectedTenners.length} Tenner(s) selected - choose specific options`;
                statusElement.style.color = '#1976d2';
                
                // Generate chunk ID for single mode even without specific options
                if (chunkIdDisplay && chunkIdValue) {
                    const chunkId = this.generateChunkId(selectedTenners, [], mode);
                    chunkIdValue.textContent = chunkId;
                    chunkIdDisplay.style.display = 'block';
                }
            } else {
                statusElement.textContent = `Single mode: ${selectedSpecifics.length} specific option(s) selected`;
                statusElement.style.color = '#1976d2';
                
                // Generate chunk ID for single mode
                if (chunkIdDisplay && chunkIdValue) {
                    const chunkId = this.generateChunkId(selectedTenners, selectedSpecifics, mode);
                    chunkIdValue.textContent = chunkId;
                    chunkIdDisplay.style.display = 'block';
                }
            }
        } else {
            // In batch mode, show permutation counts
            if (selectedTenners.length === 0) {
                statusElement.textContent = 'Select Tenners to see combination count';
                statusElement.style.color = '#666';
                if (chunkIdDisplay) chunkIdDisplay.style.display = 'none';
            } else if (selectedTenners.length === 1) {
                const permutations = 10;
                statusElement.textContent = `1 Tenner selected: ${permutations} permutations (10¹)`;
                statusElement.style.color = '#1976d2';
                
                // Generate chunk ID for batch mode
                if (chunkIdDisplay && chunkIdValue) {
                    const chunkId = this.generateChunkId(selectedTenners, [], mode);
                    chunkIdValue.textContent = chunkId;
                    chunkIdDisplay.style.display = 'block';
                }
            } else if (selectedTenners.length === 2) {
                const permutations = 100;
                statusElement.textContent = `2 Tenners selected: ${permutations} permutations (10²)`;
                statusElement.style.color = '#1976d2';
                
                // Generate chunk ID for batch mode
                if (chunkIdDisplay && chunkIdValue) {
                    const chunkId = this.generateChunkId(selectedTenners, [], mode);
                    chunkIdValue.textContent = chunkId;
                    chunkIdDisplay.style.display = 'block';
                }
            } else if (selectedTenners.length === 3) {
                const permutations = 1000;
                statusElement.textContent = `3 Tenners selected: ${permutations} permutations (10³)`;
                statusElement.style.color = '#1976d2';
                
                // Generate chunk ID for batch mode
                if (chunkIdDisplay && chunkIdValue) {
                    const chunkId = this.generateChunkId(selectedTenners, [], mode);
                    chunkIdValue.textContent = chunkId;
                    chunkIdDisplay.style.display = 'block';
                }
            }
        }
        
        // Show/hide pose selection based on T1 selection
        this.updatePoseSelection();
        
        // Update custom pose visibility
        this.updateCustomPoseVisibility();
    }
    
    updateTennerOptions() {
        const tenner1 = document.getElementById('tenner-1')?.value || '';
        const tenner2 = document.getElementById('tenner-2')?.value || '';
        const tenner3 = document.getElementById('tenner-3')?.value || '';
        
        const selectedTenners = [tenner1, tenner2, tenner3].filter(t => t !== '' && t !== 'none');
        
        // Update dropdown options to prevent duplicates
        ['tenner-1', 'tenner-2', 'tenner-3'].forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            const currentValue = select.value;
            
            // Enable/disable options based on what's already selected
            Array.from(select.options).forEach(option => {
                if (option.value === '' || option.value === 'none' || option.value === currentValue) {
                    option.disabled = false;
                } else {
                    option.disabled = selectedTenners.includes(option.value);
                }
            });
        });
    }
    
    generateChunkId(selectedTenners, selectedSpecifics, mode) {
        if (selectedTenners.length === 0) {
            return '';
        }
        
        // Load chunk mappings from skeleton definitions
        const chunkMappings = this.loadChunkMappings();
        
        // Find matching chunk based on selected Tenners
        for (const [chunkId, tennerSet] of Object.entries(chunkMappings)) {
            if (this.arraysEqual(selectedTenners.sort(), tennerSet.sort())) {
                return chunkId; // Returns CHUNK1, CHUNK2, etc.
            }
        }
        
        // If no predefined chunk matches, return custom identifier
        return `CUSTOM_${selectedTenners.join('_')}`;
    }
    
    loadChunkMappings() {
        // Define chunk mappings based on skeleton definitions
        // These correspond to SKELETON_1 through SKELETON_20 in the JSON file
        // Tenner system uses real data from JSON file
        return {
            'CHUNK1': ['T1', 'T2', 'T4'],
            'CHUNK2': ['T1', 'T3', 'T5'],
            'CHUNK3': ['T6', 'T7'],
            'CHUNK4': ['T1', 'T6', 'T8'],
            'CHUNK5': ['T2', 'T3', 'T6'],
            'CHUNK6': ['T1', 'T2', 'T3'],
            'CHUNK7': ['T4', 'T5', 'T6'],
            'CHUNK8': ['T1', 'T4', 'T7'],
            'CHUNK9': ['T2', 'T5', 'T8'],
            'CHUNK10': ['T3', 'T6', 'T9'],
            'CHUNK11': ['T1', 'T5', 'T9'],
            'CHUNK12': ['T2', 'T4', 'T8'],
            'CHUNK13': ['T3', 'T7', 'T10'],
            'CHUNK14': ['T1', 'T2', 'T5'],
            'CHUNK15': ['T4', 'T6', 'T8'],
            'CHUNK16': ['T2', 'T3', 'T7'],
            'CHUNK17': ['T1', 'T3', 'T6'],
            'CHUNK18': ['T18'],
            'CHUNK19': ['T19'],
            'CHUNK20': ['T20']
        };
    }
    
    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, i) => val === b[i]);
    }
    
    updatePoseSelection() {
        // Check if T1 is selected in any of the Tenner dropdowns
        const tenner1 = document.getElementById('tenner-1')?.value || '';
        const tenner2 = document.getElementById('tenner-2')?.value || '';
        const tenner3 = document.getElementById('tenner-3')?.value || '';
        
        const isT1Selected = tenner1 === 'T1' || tenner2 === 'T1' || tenner3 === 'T1';
        
        const poseSelection = document.getElementById('pose-selection');
        if (!poseSelection) return;
        
        if (isT1Selected) {
            // T1 is selected - show pose selection
            poseSelection.style.display = 'block';
        } else {
            // T1 is not selected - hide pose selection
            poseSelection.style.display = 'none';
        }
    }
    
    updateCustomPoseVisibility() {
        const tennerPose = document.getElementById('tenner-pose')?.value || '';
        const customPoseInput = document.getElementById('custom-pose-input');
        
        if (!customPoseInput) return;
        
        if (tennerPose === 'custom') {
            // Show custom pose input
            customPoseInput.style.display = 'block';
        } else {
            // Hide custom pose input
            customPoseInput.style.display = 'none';
        }
    }
    
    
    filterRenders() {
        const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
        const poseFilter = document.getElementById('pose-filter')?.value || 'all';
        const sceneFilter = document.getElementById('scene-filter')?.value || 'all';
        const lightingFilter = document.getElementById('lighting-filter')?.value || 'all';
        const filmTypeFilter = document.getElementById('film-type-filter')?.value || 'all';
        const textureFilter = document.getElementById('texture-filter')?.value || 'all';
        const filmStockFilter = document.getElementById('film-stock-filter')?.value || 'all';
        const cameraFilter = document.getElementById('camera-filter')?.value || 'all';
        const wardrobeFilter = document.getElementById('wardrobe-filter')?.value || 'all';
        const propsFilter = document.getElementById('props-filter')?.value || 'all';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const filmBibleFilter = document.getElementById('film-bible-filter')?.value || 'all';
        // Commented out vocabulary filter - replaced with category-based filters
        // const vocabularyFilter = document.getElementById('vocabulary-filter')?.value || 'all';
        
        // New category-based filters
        const materialFilter = document.getElementById('material-filter')?.value || 'all';
        const lightFilter = document.getElementById('light-filter')?.value || 'all';
        const colorFilter = document.getElementById('color-filter')?.value || 'all';
        const compositionFilter = document.getElementById('composition-filter')?.value || 'all';
        const toneFilter = document.getElementById('tone-filter')?.value || 'all';
        const bundleTypeFilter = document.getElementById('bundle-type-filter')?.value || 'all';
        const dateRangeFilter = document.getElementById('date-range-filter')?.value || 'all';
        
        this.filteredRenders = this.renders.filter(render => {
            // Search filter
            if (searchTerm && !render.title.toLowerCase().includes(searchTerm) && 
                !render.prompt.toLowerCase().includes(searchTerm)) {
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
            
            // Film stock filter
            if (filmStockFilter !== 'all' && render.metadata.film_stock !== filmStockFilter) {
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
            
            
            // Status filter
            if (statusFilter !== 'all' && render.metadata.status !== statusFilter) {
                return false;
            }
            
            // Film Bible filter
            if (filmBibleFilter !== 'all' && render.metadata.film_bible !== filmBibleFilter) {
                return false;
            }
            
            // Commented out vocabulary filter - replaced with category-based filters
            // if (vocabularyFilter !== 'all' && render.metadata.vocabulary_version !== vocabularyFilter) {
            //     return false;
            // }
            
            // Category-based filters (check if render contains the selected terms)
            if (materialFilter !== 'all') {
                const hasMaterial = render.prompt.toLowerCase().includes(materialFilter.toLowerCase()) ||
                                  render.metadata.descriptor?.toLowerCase().includes(materialFilter.toLowerCase());
                if (!hasMaterial) {
                    return false;
                }
            }
            
            if (lightFilter !== 'all') {
                const hasLight = render.prompt.toLowerCase().includes(lightFilter.toLowerCase()) ||
                               render.metadata.descriptor?.toLowerCase().includes(lightFilter.toLowerCase());
                if (!hasLight) {
                    return false;
                }
            }
            
            if (colorFilter !== 'all') {
                const hasColor = render.prompt.toLowerCase().includes(colorFilter.toLowerCase()) ||
                               render.metadata.descriptor?.toLowerCase().includes(colorFilter.toLowerCase());
                if (!hasColor) {
                    return false;
                }
            }
            
            if (compositionFilter !== 'all') {
                const hasComposition = render.prompt.toLowerCase().includes(compositionFilter.toLowerCase()) ||
                                      render.metadata.descriptor?.toLowerCase().includes(compositionFilter.toLowerCase());
                if (!hasComposition) {
                    return false;
                }
            }
            
            if (toneFilter !== 'all') {
                const hasTone = render.prompt.toLowerCase().includes(toneFilter.toLowerCase()) ||
                              render.metadata.descriptor?.toLowerCase().includes(toneFilter.toLowerCase());
                if (!hasTone) {
                    return false;
                }
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
        // Check for Tenner pose first, then fall back to assemble pose
        const tennerPose = document.getElementById('tenner-pose')?.value || '';
        const assemblePose = document.getElementById('assemble-pose')?.value || '';
        let pose = tennerPose || assemblePose;
        
        // Handle custom pose input
        if (tennerPose === 'custom') {
            const customPoseText = document.getElementById('custom-pose-text')?.value || '';
            if (customPoseText.trim()) {
                pose = customPoseText.trim();
            } else {
                pose = 'custom pose';
            }
        }
        
        const scene = document.getElementById('assemble-scene').value;
        const lighting = document.getElementById('assemble-lighting').value;
        const filmType = document.getElementById('assemble-film-type').value;
        const texture = document.getElementById('assemble-texture').value;
        const filmStock = document.getElementById('assemble-film-stock').value;
        const camera = document.getElementById('assemble-camera').value;
        const wardrobe = document.getElementById('assemble-wardrobe').value;
        const props = document.getElementById('assemble-props').value;
        
        // Generate preview prompt
        
        let prompt;
        if (tennerPose === 'custom') {
            // For custom poses, use the text directly
            prompt = `A character ${pose}`;
        } else {
            // For predefined poses, add "in a [pose] pose"
            prompt = `A character in a ${pose.replace('_', ' ')} pose`;
        }
        
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
        
        // Add film stock directive
        if (filmStock && filmStock !== 'all') {
            const filmStockPhrases = {
                'kodak_portra_400': 'Shot on Kodak Portra 400 film with warm color palette, natural skin tones, and fine grain',
                'kodak_ultramax_400': 'Shot on Kodak Ultramax 400 film with vibrant colors, high contrast, and medium grain',
                'fuji_superia_400': 'Shot on Fuji Superia 400 film with cool color cast, sharp detail, and fine grain',
                'ilford_hp5_400': 'Shot on Ilford HP5 400 black and white film with rich contrast, fine grain, and classic monochrome aesthetic',
                'kodak_gold_200': 'Shot on Kodak Gold 200 film with warm, saturated colors and fine grain',
                'fuji_velvia_50': 'Shot on Fuji Velvia 50 slide film with ultra-saturated colors, high contrast, and extremely fine grain',
                'kodak_tmax_100': 'Shot on Kodak T-Max 100 black and white film with ultra-fine grain, high sharpness, and smooth tonal gradations',
                'agfa_vista_200': 'Shot on Agfa Vista 200 film with natural color reproduction and fine grain',
                'lomography_color_400': 'Shot on Lomography Color 400 film with vintage color palette, increased grain, and retro aesthetic',
                'cinestill_800t': 'Shot on Cinestill 800T film with tungsten color balance, warm tones, and cinematic grain'
            };
            
            if (filmStockPhrases[filmStock]) {
                prompt += `. ${filmStockPhrases[filmStock]}`;
            } else {
                prompt += `. Shot on ${filmStock.replace('_', ' ')} film`;
            }
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
        
        // Add Tenner information if Tenners are selected
        const mode = document.querySelector('input[name="tenner-mode"]:checked')?.value || 'batch';
        const tenner1 = document.getElementById('tenner-1')?.value || '';
        const tenner2 = document.getElementById('tenner-2')?.value || '';
        const tenner3 = document.getElementById('tenner-3')?.value || '';
        
        const selectedTenners = [tenner1, tenner2, tenner3].filter(t => t !== '' && t !== 'none');
        
        // Integrate Tenner selections using real data from JSON
        if (selectedTenners.length > 0) {
            if (!this.tennerData || !this.tennerData.categories) {
                console.warn('⚠️ No Tenner data available for prompt assembly');
                return prompt;
            }
            
            if (mode === 'single') {
                const specific1 = document.getElementById('tenner-1-specific')?.value || '';
                const specific2 = document.getElementById('tenner-2-specific')?.value || '';
                const specific3 = document.getElementById('tenner-3-specific')?.value || '';
                
                const selectedSpecifics = [specific1, specific2, specific3].filter(s => s !== '');
                
                // Parse and integrate each specific option using real data
                selectedSpecifics.forEach(specific => {
                    // Parse format: "T1-0: rhino named Ruby"
                    const match = specific.match(/^(T\d+)-(\d+):\s*(.+)$/);
                    if (match) {
                        const tennerKey = match[1];
                        const optionIndex = parseInt(match[2]);
                        const descriptor = match[3];
                        
                        // Add the descriptor directly to the prompt
                        if (descriptor) {
                            prompt += ` ${descriptor}`;
                        }
                    }
                });
                
                if (selectedSpecifics.length > 0) {
                    prompt += `\n\n🎯 Tenner System (Single Mode): ${selectedTenners.join(', ')} - ${selectedSpecifics.join(', ')}`;
                } else {
                    prompt += `\n\n🎯 Tenner System (Single Mode): ${selectedTenners.join(', ')} (specific options not selected)`;
                }
            } else {
                // In batch mode, show permutation counts
                const permutationCount = Math.pow(10, selectedTenners.length);
                prompt += `\n\n🎯 Tenner System (Batch Mode): ${selectedTenners.join(', ')} (${permutationCount} permutations)`;
            }
        }
        
        prompt += `, 3D stop-motion style, high quality, detailed`;
        
        // Show preview in alert or modal
        alert(`Preview Prompt:\n\n${prompt}`);
    }
    
    async loadTennerData() {
        try {
            console.log('📊 Loading Tenner data from JSON...');
            
            const response = await fetch('data/new tenner options.json');
            if (!response.ok) {
                console.error('❌ Could not load Tenner options JSON!');
                this.tennerData = { categories: {}, summary: { total_tenners: 32 } };
                return;
            }
            
            const jsonData = await response.json();
            console.log('✅ Tenner options JSON loaded successfully');
            
            // Parse the JSON data into our expected format
            this.tennerData = {
                categories: {},
                summary: { total_tenners: 32 }
            };
            
            // The first row contains the headers (T1, T2, etc.)
            const headers = jsonData[0];
            
            // Process each option row (o0 through o9)
            for (let i = 1; i < jsonData.length; i++) {
                const optionRow = jsonData[i];
                const optionIndex = i - 1; // o0, o1, o2, etc.
                
                // For each Tenner category (T1 through T32)
                for (let j = 1; j <= 32; j++) {
                    const tennerKey = `T${j}`;
                    const headerKey = `Unnamed: ${j}`;
                    
                    if (!this.tennerData.categories[tennerKey]) {
                        this.tennerData.categories[tennerKey] = [];
                    }
                    
                    // Add the option to the category
                    this.tennerData.categories[tennerKey].push({
                        option_index: optionIndex,
                        descriptor: optionRow[headerKey] || '',
                        id: `${tennerKey.toLowerCase()}_${optionIndex.toString().padStart(2, '0')}`
                    });
                }
            }
            
            console.log(`✅ Loaded ${Object.keys(this.tennerData.categories).length} Tenner categories with options`);
            
        } catch (error) {
            console.error('❌ Error loading Tenner data:', error);
            this.tennerData = { categories: {}, summary: { total_tenners: 32 } };
        }
    }
    
    // parseCSV() and parseCSVLine() methods removed - no CSV parsing needed
    

    showError(message) {
        const container = document.querySelector('.container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = message;
            container.insertBefore(errorDiv, container.firstChild);
        }
    }
    
    // Info Modal functionality
    setupInfoModalListeners() {
        // Convert all info icon spans to proper buttons for accessibility
        this.convertInfoIconsToButtons();
        
        // Add click listeners to all info icons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('info-icon') || e.target.closest('.info-icon')) {
                const icon = e.target.classList.contains('info-icon') ? e.target : e.target.closest('.info-icon');
                const fieldId = icon.getAttribute('data-field');
                this.showInfoModal(fieldId);
            }
        });
        
        // Close modal listeners
        const closeBtn = document.getElementById('info-modal-close');
        const modal = document.getElementById('info-modal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideInfoModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideInfoModal();
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideInfoModal();
            }
        });
    }
    
    // Document Modal functionality
    setupDocModalListeners() {
        // Add click listeners to all view doc buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-doc-btn')) {
                const docType = e.target.getAttribute('data-doc');
                this.showDocModal(docType);
            }
        });
        
        // Close modal listeners
        const closeBtn = document.getElementById('doc-modal-close');
        const modal = document.getElementById('doc-modal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideDocModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideDocModal();
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideDocModal();
            }
        });
    }
    
    convertInfoIconsToButtons() {
        // Find all info icon spans and convert them to proper buttons
        const infoIcons = document.querySelectorAll('.info-icon');
        infoIcons.forEach(icon => {
            if (icon.tagName === 'SPAN') {
                const fieldId = icon.getAttribute('data-field');
                const title = icon.getAttribute('title') || 'Click for help';
                const fieldLabel = icon.closest('.field-label');
                const fieldText = fieldLabel ? fieldLabel.textContent.replace(icon.textContent, '').trim() : 'field';
                
                // Create new button element
                const button = document.createElement('button');
                button.type = 'button';
                button.className = icon.className;
                button.setAttribute('data-field', fieldId);
                button.setAttribute('title', title);
                button.setAttribute('aria-label', `Get help for ${fieldText}`);
                button.innerHTML = `<span class="sr-only">Get help for ${fieldText}</span>?`;
                
                // Replace the span with the button
                icon.parentNode.replaceChild(button, icon);
            }
        });
    }
    
    showInfoModal(fieldId) {
        const modal = document.getElementById('info-modal');
        const title = document.getElementById('info-modal-title');
        const content = document.getElementById('info-modal-content');
        
        if (!modal || !title || !content) return;
        
        const fieldInfo = this.getFieldInfo(fieldId);
        
        title.textContent = fieldInfo.title;
        content.innerHTML = fieldInfo.content;
        
        // Show modal and update ARIA attributes
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Focus the close button for keyboard users
        const closeBtn = document.getElementById('info-modal-close');
        if (closeBtn) {
            closeBtn.focus();
        }
        
        // Trap focus within modal
        this.trapFocus(modal);
    }
    
    hideInfoModal() {
        const modal = document.getElementById('info-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Return focus to the info icon that opened the modal
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('info-icon')) {
                activeElement.focus();
            }
        }
    }
    
    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
    
    getFieldInfo(fieldId) {
        const fieldInfoMap = {
            'search': {
                title: 'Search Field',
                content: `
                    <h4>How to use the search field</h4>
                    <p>Search across all renders, prompts, and tags to find specific content. The search is case-insensitive and will match partial text.</p>
                    <ul>
                        <li><strong>Character names:</strong> "Ruby", "Maxine", "Sammy"</li>
                        <li><strong>Scenes:</strong> "piazza", "library", "garden"</li>
                        <li><strong>Tags:</strong> "welcome", "musical", "dramatic"</li>
                        <li><strong>Film types:</strong> "stop motion", "claymation"</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>💡 Tip:</strong> Use multiple search terms separated by spaces to narrow down results.</p>
                    </div>
                `
            },
            'film-bible-filter': {
                title: 'Film Bible Filter',
                content: `
                    <h4>Film Bible Versions</h4>
                    <p>The Film Bible defines the visual style and aesthetic guidelines for the Anamalia project. Each version contains different artistic directions and technical specifications.</p>
                    <ul>
                        <li><strong>v1.0.0:</strong> Original style guide with basic stop-motion parameters</li>
                        <li><strong>v1.1.0:</strong> Enhanced lighting and texture definitions</li>
                        <li><strong>v2.0.0:</strong> Advanced cinematic techniques and color grading</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎬 Note:</strong> Newer versions build upon previous ones, so v2.0.0 includes all features from earlier versions.</p>
                    </div>
                `
            },
            'texture-filter': {
                title: 'Texture DNA Filter',
                content: `
                    <h4>Texture DNA System</h4>
                    <p>Texture DNA defines the material properties and surface characteristics of objects in the scene. Each texture type creates a specific visual and tactile feel.</p>
                    <ul>
                        <li><strong>Felted Wool:</strong> Soft, fibrous character materials with natural texture</li>
                        <li><strong>Stop-Motion Puppet:</strong> Realistic miniature photography aesthetic</li>
                        <li><strong>Fabric Materials:</strong> Natural cloth textures for wardrobe items</li>
                        <li><strong>Wooden Surfaces:</strong> Aged wood with visible grain and patina</li>
                        <li><strong>Ceramic & Pottery:</strong> Smooth glazed surfaces with hand-crafted imperfections</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎨 Tip:</strong> Mix different texture DNAs to create interesting material contrasts in your scenes.</p>
                    </div>
                `
            },
            'film-stock-filter': {
                title: 'Film Stock Filter',
                content: `
                    <h4>Film Stock Characteristics</h4>
                    <p>Different film stocks create unique color palettes, grain patterns, and overall aesthetic qualities. Each stock has distinct characteristics for different moods and styles.</p>
                    <ul>
                        <li><strong>Kodak Portra 400:</strong> Warm, natural skin tones, fine grain</li>
                        <li><strong>Fuji Velvia 50:</strong> Ultra-saturated colors, high contrast</li>
                        <li><strong>Ilford HP5 400:</strong> Classic black and white, rich contrast</li>
                        <li><strong>Cinestill 800T:</strong> Tungsten balanced, cinematic grain</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>📸 Pro Tip:</strong> Color films work best for warm, inviting scenes, while black and white films add dramatic, artistic flair.</p>
                    </div>
                `
            },
            // Commented out vocabulary-filter help - replaced with category-based help
            // 'vocabulary-filter': {
            //     title: 'Vocabulary Filter',
            //     content: `
            //         <h4>Lexicon Versions</h4>
            //         <p>The vocabulary system defines the specific terms and phrases used in prompt generation. Each version contains different descriptive language and terminology.</p>
            //         <ul>
            //             <li><strong>Lexicon v1:</strong> Basic descriptive terms and simple language</li>
            //             <li><strong>Lexicon v2:</strong> Enhanced technical vocabulary and artistic terms</li>
            //             <li><strong>Lexicon 2025-10-23:</strong> Latest version with advanced cinematic terminology</li>
            //         </ul>
            //         <div class="highlight">
            //             <p><strong>📝 Note:</strong> Newer lexicons provide more precise and detailed descriptions for better AI generation results.</p>
            //         </div>
            //     `
            // },
            
            'material-filter': {
                title: 'Material Filter',
                content: `
                    <h4>Material Descriptors</h4>
                    <p>Filter renders by the material characteristics used in their descriptions. These terms define the tactile and visual qualities of surfaces and textures.</p>
                    <ul>
                        <li><strong>Felted:</strong> Soft, matte texture with fine fibers</li>
                        <li><strong>Woolen:</strong> Natural fiber texture with warmth</li>
                        <li><strong>Fibrous:</strong> Textured surface with visible fiber patterns</li>
                        <li><strong>Matte:</strong> Non-reflective, soft surface finish</li>
                        <li><strong>Handcrafted:</strong> Artisanal, organic texture with character</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎨 Material Impact:</strong> Material descriptors significantly influence the tactile and visual appeal of stop-motion characters.</p>
                    </div>
                `
            },
            
            'light-filter': {
                title: 'Light Filter',
                content: `
                    <h4>Lighting Descriptors</h4>
                    <p>Filter renders by the lighting characteristics used in their descriptions. These terms define the mood, direction, and quality of illumination.</p>
                    <ul>
                        <li><strong>Warm:</strong> Golden, inviting light with orange/yellow tones</li>
                        <li><strong>Directional:</strong> Focused light with clear shadows and highlights</li>
                        <li><strong>Diffused:</strong> Soft, even lighting with minimal shadows</li>
                        <li><strong>Golden Hour:</strong> Warm, low-angle sunlight with rich colors</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>💡 Lighting Mood:</strong> Lighting descriptors create the emotional atmosphere and visual depth of each scene.</p>
                    </div>
                `
            },
            
            'color-filter': {
                title: 'Color Filter',
                content: `
                    <h4>Color Descriptors</h4>
                    <p>Filter renders by the color palette used in their descriptions. These terms define the chromatic characteristics and mood of the visual composition.</p>
                    <ul>
                        <li><strong>Ochre:</strong> Warm, earthy yellow-brown tones</li>
                        <li><strong>Cream:</strong> Soft, warm off-white with subtle warmth</li>
                        <li><strong>Soft Pink:</strong> Gentle, muted pink with delicate tones</li>
                        <li><strong>Muted Blue:</strong> Subdued, calm blue with reduced saturation</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎨 Color Harmony:</strong> Color descriptors establish the visual mood and emotional tone of each composition.</p>
                    </div>
                `
            },
            
            'composition-filter': {
                title: 'Composition Filter',
                content: `
                    <h4>Composition Descriptors</h4>
                    <p>Filter renders by the compositional characteristics used in their descriptions. These terms define the spatial arrangement and visual structure.</p>
                    <ul>
                        <li><strong>Miniature:</strong> Small-scale, detailed composition with fine details</li>
                        <li><strong>Tabletop:</strong> Elevated perspective with controlled environment</li>
                        <li><strong>Cinematic Depth:</strong> Layered composition with foreground, midground, and background</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>📐 Visual Structure:</strong> Composition descriptors control the spatial relationships and visual hierarchy of each scene.</p>
                    </div>
                `
            },
            
            'tone-filter': {
                title: 'Tone Filter',
                content: `
                    <h4>Tone Descriptors</h4>
                    <p>Filter renders by the emotional tone used in their descriptions. These terms define the mood and feeling conveyed by the visual composition.</p>
                    <ul>
                        <li><strong>Nostalgic:</strong> Warm, sentimental feeling with gentle melancholy</li>
                        <li><strong>Cheerful:</strong> Bright, optimistic mood with positive energy</li>
                        <li><strong>Gentle:</strong> Soft, tender feeling with delicate sensitivity</li>
                        <li><strong>Inviting:</strong> Welcoming, approachable mood that draws the viewer in</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>💝 Emotional Impact:</strong> Tone descriptors create the emotional connection and viewer response to each composition.</p>
                    </div>
                `
            },
            'scene-filter': {
                title: 'Scene Filter',
                content: `
                    <h4>Available Scenes</h4>
                    <p>Scenes define the environment and setting where characters are placed. Each scene has unique architectural and atmospheric characteristics.</p>
                    <ul>
                        <li><strong>Piazza v2:</strong> Outdoor cobblestone square with classical architecture</li>
                        <li><strong>Library v1:</strong> Cozy indoor space with books, warm lighting</li>
                        <li><strong>Garden v1:</strong> Natural outdoor setting with plants and organic elements</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🏛️ Tip:</strong> Scenes work best when paired with appropriate lighting - outdoor scenes with natural light, indoor scenes with ambient lighting.</p>
                    </div>
                `
            },
            'camera-filter': {
                title: 'Camera Filter',
                content: `
                    <h4>Camera Positions and Angles</h4>
                    <p>Camera settings define the viewpoint and perspective of the shot. Different angles create different emotional impacts and visual compositions.</p>
                    <ul>
                        <li><strong>35mm Eye-level:</strong> Natural human perspective, neutral emotional tone</li>
                        <li><strong>35mm Low Angle:</strong> Dramatic, empowering viewpoint</li>
                        <li><strong>35mm High Angle:</strong> Vulnerable, intimate perspective</li>
                        <li><strong>50mm Portrait:</strong> Close-up, detailed character focus</li>
                        <li><strong>24mm Wide:</strong> Environmental context, establishing shots</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>📐 Pro Tip:</strong> Use low angles for heroic characters, high angles for vulnerable moments, and eye-level for neutral storytelling.</p>
                    </div>
                `
            },
            'props-filter': {
                title: 'Props Filter',
                content: `
                    <h4>Available Props</h4>
                    <p>Props add narrative elements and character development to scenes. They help tell stories and create more engaging compositions.</p>
                    <ul>
                        <li><strong>Tea Cup:</strong> Creates cozy, contemplative atmosphere</li>
                        <li><strong>Book:</strong> Suggests learning, wisdom, or quiet moments</li>
                        <li><strong>Musical Instrument:</strong> Adds performance and artistic elements</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎭 Storytelling:</strong> Props should support the character's personality and the scene's mood. Choose props that enhance the narrative.</p>
                    </div>
                `
            },
            'wardrobe-filter': {
                title: 'Wardrobe Filter',
                content: `
                    <h4>Clothing & Accessories</h4>
                    <p>Wardrobe items help define character personality and add visual interest to compositions. Each item creates a different character archetype.</p>
                    <ul>
                        <li><strong>Sun Hat:</strong> Casual, outdoor, friendly character</li>
                        <li><strong>Cowboy Hat:</strong> Adventurous, independent, western theme</li>
                        <li><strong>Spectacles:</strong> Intellectual, studious, wise character</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>👔 Character Design:</strong> Wardrobe choices should reflect the character's role and personality in the story.</p>
                    </div>
                `
            },
            'lighting-filter': {
                title: 'Lighting Filter',
                content: `
                    <h4>Lighting Systems</h4>
                    <p>Lighting creates mood, atmosphere, and emotional tone. Each lighting setup produces different shadows, highlights, and color temperatures.</p>
                    <ul>
                        <li><strong>Golden Hour:</strong> Warm, romantic, magical atmosphere</li>
                        <li><strong>Soft Indoor Ambient:</strong> Cozy, comfortable, intimate feeling</li>
                        <li><strong>Dramatic Studio Shadows:</strong> Intense, cinematic, high contrast</li>
                        <li><strong>Cool Moonlight:</strong> Mysterious, serene, nighttime mood</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>💡 Lighting Psychology:</strong> Warm light feels inviting and safe, cool light feels mysterious and distant, dramatic shadows add tension and drama.</p>
                    </div>
                `
            },
            'film-type-filter': {
                title: 'Film Type Filter',
                content: `
                    <h4>Animation Styles</h4>
                    <p>Different film types create distinct visual aesthetics and emotional impacts. Each style has unique characteristics and appeal.</p>
                    <ul>
                        <li><strong>Stop Motion:</strong> Classic, handcrafted, tactile feel</li>
                        <li><strong>Claymation:</strong> Playful, organic, sculptural quality</li>
                        <li><strong>Puppet Animation:</strong> Theatrical, detailed, character-focused</li>
                        <li><strong>Miniature:</strong> Detailed, realistic, scale-focused</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎬 Style Choice:</strong> Stop motion feels authentic and handmade, while claymation adds playful charm and organic texture.</p>
                    </div>
                `
            },
            'status-filter': {
                title: 'Status Filter',
                content: `
                    <h4>Render Status</h4>
                    <p>Track the progress and approval status of your generated renders. This helps you manage your workflow and identify which renders need attention.</p>
                    <ul>
                        <li><strong>Completed:</strong> Successfully generated and ready for review</li>
                        <li><strong>Pending:</strong> Currently being processed or queued</li>
                        <li><strong>Failed:</strong> Generation failed due to technical issues</li>
                        <li><strong>Approved:</strong> Manually approved for use</li>
                        <li><strong>Rejected:</strong> Not suitable for the project</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>✅ Workflow:</strong> Use status filters to quickly find renders that need approval or identify failed generations that need to be retried.</p>
                    </div>
                `
            },
            'bundle-type-filter': {
                title: 'Bundle Type Filter',
                content: `
                    <h4>Bundle Generation Types</h4>
                    <p>Different bundle types use different generation strategies and produce varying numbers of outputs. Each type serves different creative purposes.</p>
                    <ul>
                        <li><strong>Standard Bundle:</strong> Single, carefully crafted prompt</li>
                        <li><strong>Tenner Chunk:</strong> Predefined combinations from skeleton definitions</li>
                        <li><strong>Individual Tenner:</strong> Single Tenner with all 10 variations</li>
                        <li><strong>Matrix Generated:</strong> All possible combinations of selected elements</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎯 Strategy:</strong> Use Standard for precision, Tenner Chunks for proven combinations, Individual Tenners for exploration, and Matrix for comprehensive coverage.</p>
                    </div>
                `
            },
            'date-range-filter': {
                title: 'Date Range Filter',
                content: `
                    <h4>Time-based Filtering</h4>
                    <p>Filter renders by when they were created to find recent work, track progress over time, or locate specific batches of renders.</p>
                    <ul>
                        <li><strong>Today:</strong> Renders created in the last 24 hours</li>
                        <li><strong>This Week:</strong> Renders from the past 7 days</li>
                        <li><strong>This Month:</strong> Renders from the past 30 days</li>
                        <li><strong>Custom Range:</strong> Specify exact date boundaries</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>📅 Organization:</strong> Use date filters to review recent work, track daily progress, or find renders from specific project phases.</p>
                    </div>
                `
            },
            'tenner-pose': {
                title: 'Character Pose',
                content: `
                    <h4>Character Poses</h4>
                    <p>Poses define the body language and emotional expression of your characters. Each pose conveys different moods and storytelling elements.</p>
                    <ul>
                        <li><strong>Arms Open Welcome:</strong> Friendly, inviting, approachable</li>
                        <li><strong>Seated Contemplative:</strong> Thoughtful, peaceful, introspective</li>
                        <li><strong>Pointing Forward:</strong> Directive, guiding, purposeful</li>
                        <li><strong>Hands on Hips:</strong> Confident, assertive, determined</li>
                        <li><strong>Waving Hello:</strong> Greeting, friendly, social</li>
                        <li><strong>Standing Confident:</strong> Strong, proud, self-assured</li>
                        <li><strong>Custom:</strong> Create your own unique pose description</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎭 Body Language:</strong> Poses should match the character's personality and the scene's emotional tone. Choose poses that support your story.</p>
                    </div>
                `
            },
            'custom-pose-text': {
                title: 'Custom Pose Description',
                content: `
                    <h4>Custom Pose Input</h4>
                    <p>When you select "Custom" from the pose dropdown, you can enter your own pose description here.</p>
                    <ul>
                        <li><strong>Be Descriptive:</strong> Use clear, specific language (e.g., "sitting on a chair reading a book")</li>
                        <li><strong>Include Context:</strong> Mention body position, arm placement, facial expression</li>
                        <li><strong>Use Natural Language:</strong> Write as you would describe the pose to someone</li>
                        <li><strong>Examples:</strong> "kneeling with hands clasped in prayer", "leaning against a wall with arms crossed"</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>💡 Tip:</strong> The more specific your description, the better the AI will understand and render your desired pose.</p>
                    </div>
                `
            },
            'assemble-count': {
                title: 'Number of Bundles',
                content: `
                    <h4>Bundle Generation Count</h4>
                    <p>Specify how many prompt bundles you want to generate. Each bundle will use your selected settings to create unique variations.</p>
                    <ul>
                        <li><strong>1-10:</strong> Quick generation for testing settings</li>
                        <li><strong>10-50:</strong> Moderate batch for exploration</li>
                        <li><strong>50-100:</strong> Large batch for comprehensive coverage</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>⚡ Performance:</strong> Higher counts take more time to process. Start with smaller numbers to test your settings, then increase for full batches.</p>
                    </div>
                `
            },
            'assemble-bundle-type': {
                title: 'Bundle Type',
                content: `
                    <h4>Generation Strategy</h4>
                    <p>Choose how your bundles will be generated. Each type uses different algorithms and produces different results.</p>
                    <ul>
                        <li><strong>Standard Bundle:</strong> Single, carefully crafted prompt</li>
                        <li><strong>Tenner Chunk:</strong> Predefined combinations from skeleton definitions</li>
                        <li><strong>Individual Tenner:</strong> Single Tenner with all 10 variations</li>
                        <li><strong>Matrix Generated:</strong> All possible combinations of selected elements</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎯 Strategy:</strong> Standard for precision, Tenner Chunks for proven combinations, Individual Tenners for exploration, Matrix for comprehensive coverage.</p>
                    </div>
                `
            },
            'assemble-film-bible': {
                title: 'Film Bible Selection',
                content: `
                    <h4>Film Bible for Assembly</h4>
                    <p>Select the Film Bible version to use when generating new prompts. This determines the visual style and aesthetic guidelines applied to your bundles.</p>
                    <ul>
                        <li><strong>Film Bible v1.0.0:</strong> Original style guide with basic stop-motion parameters</li>
                        <li><strong>Film Bible v1.1.0:</strong> Enhanced lighting and texture definitions</li>
                        <li><strong>Film Bible v2.0.0:</strong> Advanced cinematic techniques and color grading</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎬 Style Consistency:</strong> All generated bundles will follow the selected Film Bible's visual guidelines and technical specifications.</p>
                    </div>
                `
            },
            'assemble-texture': {
                title: 'Texture DNA Selection',
                content: `
                    <h4>Texture DNA for Assembly</h4>
                    <p>Choose the primary texture DNA that will define the material characteristics of your generated scenes. This creates the tactile and visual feel of your renders.</p>
                    <ul>
                        <li><strong>Felted Wool Character DNA:</strong> Soft, fibrous character materials (Canonical choice)</li>
                        <li><strong>Stop-Motion Puppet Realism:</strong> Authentic miniature photography aesthetic</li>
                        <li><strong>Fabric Wardrobe Materials:</strong> Natural cloth textures for clothing</li>
                        <li><strong>Wooden Prop Surfaces:</strong> Aged wood with visible grain</li>
                        <li><strong>Ceramic & Pottery:</strong> Smooth glazed surfaces with imperfections</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎨 Material Focus:</strong> The selected texture DNA will be the primary material characteristic applied to your generated scenes.</p>
                    </div>
                `
            },
            'assemble-film-stock': {
                title: 'Film Stock Selection',
                content: `
                    <h4>Film Stock for Assembly</h4>
                    <p>Select the film stock that will determine the color palette, grain, and overall aesthetic of your generated renders. Each stock creates a distinct visual mood.</p>
                    <ul>
                        <li><strong>Kodak Portra 400:</strong> Warm, natural tones with fine grain</li>
                        <li><strong>Kodak Ultramax 400:</strong> Vibrant colors with moderate grain</li>
                        <li><strong>Fuji Superia 400:</strong> Balanced color reproduction</li>
                        <li><strong>Ilford HP5 400:</strong> Classic black and white with rich contrast</li>
                        <li><strong>Cinestill 800T:</strong> Tungsten balanced with cinematic grain</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>📸 Aesthetic Choice:</strong> Color films create warm, inviting scenes while black and white films add dramatic, artistic flair.</p>
                    </div>
                `
            },
            // Commented out assemble-vocabulary help - replaced with category-based help
            // 'assemble-vocabulary': {
            //     title: 'Vocabulary Selection',
            //     content: `
            //         <h4>Lexicon for Assembly</h4>
            //         <p>Choose the vocabulary version that will be used to generate descriptive language in your prompts. Each lexicon provides different levels of technical detail and artistic terminology.</p>
            //         <ul>
            //             <li><strong>Lexicon v1:</strong> Basic descriptive terms and simple language</li>
            //             <li><strong>Lexicon v2:</strong> Enhanced technical vocabulary and artistic terms</li>
            //             <li><strong>Lexicon 2025-10-23:</strong> Latest version with advanced cinematic terminology</li>
            //         </ul>
            //         <div class="highlight">
            //             <p><strong>📝 Language Precision:</strong> Newer lexicons provide more precise and detailed descriptions for better AI generation results.</p>
            //         </div>
            //     `
            // },
            
            'assemble-material': {
                title: 'Material Selection',
                content: `
                    <h4>Material Descriptors for Assembly</h4>
                    <p>Select the material characteristics that will be used in your prompt generation. These terms define the tactile and visual qualities of surfaces and textures.</p>
                    <ul>
                        <li><strong>Felted:</strong> Soft, matte texture with fine fibers</li>
                        <li><strong>Woolen:</strong> Natural fiber texture with warmth</li>
                        <li><strong>Fibrous:</strong> Textured surface with visible fiber patterns</li>
                        <li><strong>Matte:</strong> Non-reflective, soft surface finish</li>
                        <li><strong>Handcrafted:</strong> Artisanal, organic texture with character</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎨 Material Impact:</strong> Material descriptors significantly influence the tactile and visual appeal of stop-motion characters.</p>
                    </div>
                `
            },
            
            'assemble-light': {
                title: 'Lighting Selection',
                content: `
                    <h4>Lighting Descriptors for Assembly</h4>
                    <p>Select the lighting characteristics that will be used in your prompt generation. These terms define the mood, direction, and quality of illumination.</p>
                    <ul>
                        <li><strong>Warm:</strong> Golden, inviting light with orange/yellow tones</li>
                        <li><strong>Directional:</strong> Focused light with clear shadows and highlights</li>
                        <li><strong>Diffused:</strong> Soft, even lighting with minimal shadows</li>
                        <li><strong>Golden Hour:</strong> Warm, low-angle sunlight with rich colors</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>💡 Lighting Mood:</strong> Lighting descriptors create the emotional atmosphere and visual depth of each scene.</p>
                    </div>
                `
            },
            
            'assemble-color': {
                title: 'Color Selection',
                content: `
                    <h4>Color Descriptors for Assembly</h4>
                    <p>Select the color palette that will be used in your prompt generation. These terms define the chromatic characteristics and mood of the visual composition.</p>
                    <ul>
                        <li><strong>Ochre:</strong> Warm, earthy yellow-brown tones</li>
                        <li><strong>Cream:</strong> Soft, warm off-white with subtle warmth</li>
                        <li><strong>Soft Pink:</strong> Gentle, muted pink with delicate tones</li>
                        <li><strong>Muted Blue:</strong> Subdued, calm blue with reduced saturation</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎨 Color Harmony:</strong> Color descriptors establish the visual mood and emotional tone of each composition.</p>
                    </div>
                `
            },
            
            'assemble-composition': {
                title: 'Composition Selection',
                content: `
                    <h4>Composition Descriptors for Assembly</h4>
                    <p>Select the compositional characteristics that will be used in your prompt generation. These terms define the spatial arrangement and visual structure.</p>
                    <ul>
                        <li><strong>Miniature:</strong> Small-scale, detailed composition with fine details</li>
                        <li><strong>Tabletop:</strong> Elevated perspective with controlled environment</li>
                        <li><strong>Cinematic Depth:</strong> Layered composition with foreground, midground, and background</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>📐 Visual Structure:</strong> Composition descriptors control the spatial relationships and visual hierarchy of each scene.</p>
                    </div>
                `
            },
            
            'assemble-tone': {
                title: 'Tone Selection',
                content: `
                    <h4>Tone Descriptors for Assembly</h4>
                    <p>Select the emotional tone that will be used in your prompt generation. These terms define the mood and feeling conveyed by the visual composition.</p>
                    <ul>
                        <li><strong>Nostalgic:</strong> Warm, sentimental feeling with gentle melancholy</li>
                        <li><strong>Cheerful:</strong> Bright, optimistic mood with positive energy</li>
                        <li><strong>Gentle:</strong> Soft, tender feeling with delicate sensitivity</li>
                        <li><strong>Inviting:</strong> Welcoming, approachable mood that draws the viewer in</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>💝 Emotional Impact:</strong> Tone descriptors create the emotional connection and viewer response to each composition.</p>
                    </div>
                `
            },
            'assemble-scene': {
                title: 'Scene Selection',
                content: `
                    <h4>Scene Environment</h4>
                    <p>Select the environment where your characters will be placed. Each scene has unique architectural and atmospheric characteristics that influence the overall mood.</p>
                    <ul>
                        <li><strong>All Scenes:</strong> Let the system choose appropriate scenes</li>
                        <li><strong>Piazza v2:</strong> Outdoor cobblestone square with classical architecture</li>
                        <li><strong>Library v1:</strong> Cozy indoor space with books and warm lighting</li>
                        <li><strong>Garden v1:</strong> Natural outdoor setting with plants and organic elements</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🏛️ Environment Matching:</strong> Choose scenes that complement your lighting selection - outdoor scenes with natural light, indoor scenes with ambient lighting.</p>
                    </div>
                `
            },
            'assemble-camera': {
                title: 'Camera Selection',
                content: `
                    <h4>Camera Position and Angle</h4>
                    <p>Select the camera viewpoint that will define the perspective and emotional impact of your renders. Different angles create different storytelling effects.</p>
                    <ul>
                        <li><strong>35mm Eye-level:</strong> Natural human perspective, neutral emotional tone (Canonical)</li>
                        <li><strong>35mm 3/4 Height:</strong> Slightly elevated, balanced viewpoint</li>
                        <li><strong>35mm Low Angle:</strong> Dramatic, empowering viewpoint</li>
                        <li><strong>35mm High Angle:</strong> Vulnerable, intimate perspective</li>
                        <li><strong>50mm Portrait:</strong> Close-up, detailed character focus</li>
                        <li><strong>24mm Wide:</strong> Environmental context, establishing shots</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>📐 Emotional Impact:</strong> Use low angles for heroic characters, high angles for vulnerable moments, and eye-level for neutral storytelling.</p>
                    </div>
                `
            },
            'assemble-wardrobe': {
                title: 'Wardrobe Selection',
                content: `
                    <h4>Character Clothing & Accessories</h4>
                    <p>Choose wardrobe items that will define your character's personality and add visual interest to your compositions. Each item creates a different character archetype.</p>
                    <ul>
                        <li><strong>No Wardrobe:</strong> Natural character appearance without accessories</li>
                        <li><strong>Sun Hat:</strong> Casual, outdoor, friendly character</li>
                        <li><strong>Cowboy Hat:</strong> Adventurous, independent, western theme</li>
                        <li><strong>Spectacles:</strong> Intellectual, studious, wise character</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>👔 Character Design:</strong> Wardrobe choices should reflect the character's role and personality in the story you want to tell.</p>
                    </div>
                `
            },
            'assemble-props': {
                title: 'Props Selection',
                content: `
                    <h4>Scene Props and Objects</h4>
                    <p>Select props that will add narrative elements and character development to your scenes. Props help tell stories and create more engaging compositions.</p>
                    <ul>
                        <li><strong>No Props:</strong> Clean scene without additional objects</li>
                        <li><strong>Tea Cup:</strong> Creates cozy, contemplative atmosphere</li>
                        <li><strong>Book:</strong> Suggests learning, wisdom, or quiet moments</li>
                        <li><strong>Musical Instrument:</strong> Adds performance and artistic elements</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎭 Storytelling:</strong> Props should support the character's personality and the scene's mood. Choose props that enhance your narrative.</p>
                    </div>
                `
            },
            'assemble-lighting': {
                title: 'Lighting Selection',
                content: `
                    <h4>Lighting System</h4>
                    <p>Choose the lighting setup that will create the mood, atmosphere, and emotional tone of your renders. Each lighting system produces different shadows, highlights, and color temperatures.</p>
                    <ul>
                        <li><strong>Golden Hour Directional Rig:</strong> Warm, romantic, magical atmosphere (Canonical)</li>
                        <li><strong>Soft Indoor Ambient:</strong> Cozy, comfortable, intimate feeling</li>
                        <li><strong>Dramatic Studio Shadows:</strong> Intense, cinematic, high contrast</li>
                        <li><strong>Studio White Clean:</strong> Bright, clean, professional look</li>
                        <li><strong>Warm Sunset Glow:</strong> Romantic, golden, evening mood</li>
                        <li><strong>Cool Moonlight:</strong> Mysterious, serene, nighttime mood</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>💡 Lighting Psychology:</strong> Warm light feels inviting and safe, cool light feels mysterious and distant, dramatic shadows add tension and drama.</p>
                    </div>
                `
            },
            'assemble-film-type': {
                title: 'Film Type Selection',
                content: `
                    <h4>Animation Style</h4>
                    <p>Select the film type that will define the visual aesthetic and emotional impact of your renders. Each style has unique characteristics and appeal.</p>
                    <ul>
                        <li><strong>All Film Types:</strong> Let the system choose appropriate styles</li>
                        <li><strong>Stop Motion:</strong> Classic, handcrafted, tactile feel</li>
                        <li><strong>Claymation:</strong> Playful, organic, sculptural quality</li>
                        <li><strong>Puppet Animation:</strong> Theatrical, detailed, character-focused</li>
                        <li><strong>Miniature:</strong> Detailed, realistic, scale-focused</li>
                        <li><strong>Diorama:</strong> Intricate, detailed, museum-like quality</li>
                        <li><strong>Tilt Shift:</strong> Selective focus, dreamy, artistic effect</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎬 Style Choice:</strong> Stop motion feels authentic and handmade, while claymation adds playful charm and organic texture.</p>
                    </div>
                `
            }
        };
        
        return fieldInfoMap[fieldId] || {
            title: 'Field Information',
            content: '<p>Information for this field is not available.</p>'
        };
    }
    
    // Document Modal methods
    async showDocModal(docType) {
        const modal = document.getElementById('doc-modal');
        const title = document.getElementById('doc-modal-title');
        const content = document.getElementById('doc-modal-content');
        
        if (!modal || !title || !content) return;
        
        // Set loading state
        title.textContent = 'Loading Documentation...';
        content.innerHTML = '<div class="loading">Loading document...</div>';
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        try {
            const docInfo = await this.loadDocument(docType);
            title.textContent = docInfo.title;
            content.innerHTML = docInfo.content;
        } catch (error) {
            console.error('Error loading document:', error);
            title.textContent = 'Error Loading Document';
            content.innerHTML = `
                <div class="error">
                    <h4>Failed to load document</h4>
                    <p>Unable to load the requested documentation. Please try again later.</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                </div>
            `;
        }
    }
    
    hideDocModal() {
        const modal = document.getElementById('doc-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    async loadDocument(docType) {
        const docMap = {
            'film-bible': {
                title: 'Film Bible Documentation',
                path: '../docs/anamalia_film_bible.md'
            },
            'vocabulary': {
                title: 'Vocabulary & Lexicon Documentation',
                path: '../data/anamalia_prompt_assembler_development_guide.md'
            }
        };
        
        const docInfo = docMap[docType];
        if (!docInfo) {
            throw new Error(`Unknown document type: ${docType}`);
        }
        
        try {
            const response = await fetch(docInfo.path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const markdown = await response.text();
            const htmlContent = this.parseMarkdown(markdown);
            
            return {
                title: docInfo.title,
                content: htmlContent
            };
        } catch (error) {
            // If the file doesn't exist, show a placeholder with available docs
            return {
                title: docInfo.title,
                content: this.getPlaceholderContent(docType)
            };
        }
    }
    
    parseMarkdown(markdown) {
        // Simple markdown parser for basic formatting
        let html = markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Lists
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        // Wrap in paragraphs
        html = '<p>' + html + '</p>';
        
        // Fix list formatting
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        html = html.replace(/<\/ul><ul>/g, '');
        
        return html;
    }
    
    getPlaceholderContent(docType) {
        const placeholders = {
            'film-bible': `
                <h2>Film Bible Documentation</h2>
                <p>The Film Bible defines the visual style and aesthetic guidelines for the Anamalia project. It contains detailed specifications for:</p>
                <ul>
                    <li><strong>Visual Style:</strong> Character design, color palettes, and artistic direction</li>
                    <li><strong>Technical Specifications:</strong> Camera angles, lighting setups, and composition rules</li>
                    <li><strong>Narrative Guidelines:</strong> Storytelling principles and character development</li>
                    <li><strong>Production Standards:</strong> Quality benchmarks and consistency requirements</li>
                </ul>
                <div class="highlight">
                    <p><strong>📖 Note:</strong> The complete Film Bible documentation is available in the <code>docs/anamalia_film_bible.md</code> file.</p>
                </div>
                <h3>Available Versions</h3>
                <ul>
                    <li><strong>v1.0.0:</strong> Original style guide with basic stop-motion parameters</li>
                    <li><strong>v1.1.0:</strong> Enhanced lighting and texture definitions</li>
                    <li><strong>v2.0.0:</strong> Advanced cinematic techniques and color grading</li>
                </ul>
            `,
            'vocabulary': `
                <h2>Vocabulary & Lexicon Documentation</h2>
                <p>The vocabulary system defines the specific terms and phrases used in prompt generation. It ensures consistent and precise language for AI generation through five main categories.</p>
                
                <h3>Lexicon Categories</h3>
                <p>The controlled vocabulary is organized into five main categories, each defining specific aspects of the visual composition:</p>
                
                <h4>🎨 Material</h4>
                <p>Defines the tactile and visual qualities of surfaces and textures:</p>
                <ul>
                    <li><strong>Felted:</strong> Soft, matte texture with fine fibers</li>
                    <li><strong>Woolen:</strong> Natural fiber texture with warmth</li>
                    <li><strong>Fibrous:</strong> Textured surface with visible fiber patterns</li>
                    <li><strong>Matte:</strong> Non-reflective, soft surface finish</li>
                    <li><strong>Handcrafted:</strong> Artisanal, organic texture with character</li>
                </ul>
                
                <h4>💡 Light</h4>
                <p>Defines the mood, direction, and quality of illumination:</p>
                <ul>
                    <li><strong>Warm:</strong> Golden, inviting light with orange/yellow tones</li>
                    <li><strong>Directional:</strong> Focused light with clear shadows and highlights</li>
                    <li><strong>Diffused:</strong> Soft, even lighting with minimal shadows</li>
                    <li><strong>Golden Hour:</strong> Warm, low-angle sunlight with rich colors</li>
                </ul>
                
                <h4>🎨 Color</h4>
                <p>Defines the chromatic characteristics and mood of the visual composition:</p>
                <ul>
                    <li><strong>Ochre:</strong> Warm, earthy yellow-brown tones</li>
                    <li><strong>Cream:</strong> Soft, warm off-white with subtle warmth</li>
                    <li><strong>Soft Pink:</strong> Gentle, muted pink with delicate tones</li>
                    <li><strong>Muted Blue:</strong> Subdued, calm blue with reduced saturation</li>
                </ul>
                
                <h4>📐 Composition</h4>
                <p>Defines the spatial arrangement and visual structure:</p>
                <ul>
                    <li><strong>Miniature:</strong> Small-scale, detailed composition with fine details</li>
                    <li><strong>Tabletop:</strong> Elevated perspective with controlled environment</li>
                    <li><strong>Cinematic Depth:</strong> Layered composition with foreground, midground, and background</li>
                </ul>
                
                <h4>💝 Tone</h4>
                <p>Defines the emotional tone and mood conveyed by the visual composition:</p>
                <ul>
                    <li><strong>Nostalgic:</strong> Warm, sentimental feeling with gentle melancholy</li>
                    <li><strong>Cheerful:</strong> Bright, optimistic mood with positive energy</li>
                    <li><strong>Gentle:</strong> Soft, tender feeling with delicate sensitivity</li>
                    <li><strong>Inviting:</strong> Welcoming, approachable mood that draws the viewer in</li>
                </ul>
                
                <div class="highlight">
                    <p><strong>📝 Note:</strong> The complete vocabulary documentation is available in the <code>data/anamalia_prompt_assembler_development_guide.md</code> file.</p>
                </div>
                
                <h3>Versioned Lexicons (Currently Commented Out)</h3>
                <p><em>Note: Versioned lexicons have been temporarily commented out and can be added back later when needed.</em></p>
                <!--
                <ul>
                    <li><strong>Lexicon v1:</strong> Basic descriptive terms and simple language</li>
                    <li><strong>Lexicon v2:</strong> Enhanced technical vocabulary and artistic terms</li>
                    <li><strong>Lexicon 2025-10-23:</strong> Latest version with advanced cinematic terminology</li>
                </ul>
                -->
            `
        };
        
        return placeholders[docType] || '<p>Documentation not available.</p>';
    }
}

// Initialize the viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.viewer = new AnamaliaViewer();
});
