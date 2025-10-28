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
        this.gridOverlayVisible = false;
        this.currentCompositeRender = null;
        this.projectManager = new ProjectSettingsManager();
        
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
        this.setupPaletteListeners();
        this.setupInfoModalListeners();
        this.setupDocModalListeners();
        this.setupCompositeModalListeners();
        this.setupFloatingToolsListeners();
        this.initPromptPreviewModal();
        this.initOutputParameterSync();
        
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
            },
            {
                id: 'bundle_005',
                title: 'Ruby Rhino - Green Screen Welcome',
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDBmZjAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzAwMDAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdyZWVuLVNjcmVlbiBQbGF0ZTwvdGV4dD48L3N2Zz4=',
                metadata: {
                    character: 'ruby_rhino',
                    pose: 'arms_open_welcome',
                    scene: 'greenscreen_v1',
                    lighting: 'lighting_001',
                    film_type: 'stop_motion',
                    texture: 'texture_001',
                    film_stock: 'kodak_portra_400',
                    camera: 'camera_001',
                    model: 't2i_model_x@0.9',
                    wardrobe: [],
                    props: [],
                    film_bible: 'film_bible@1.0.0',
                    vocabulary_version: 'lexicon@v1',
                    bundle_type: 'greenscreen_dual',
                    output_mode: 'greenscreen_dual',
                    tape_markings: true,
                    chroma_key: {
                        color: '#00FF00',
                        tolerance: 'standard'
                    },
                    spatial_metadata: {
                        character_origin: [0, 0, 0.1],
                        camera_position: [0, 0, 1.0],
                        stage_grid: '10cm'
                    },
                    created_at: '2025-10-24T10:30:15.000Z',
                    status: 'completed',
                    approved: true
                },
                tags: ['rhino', 'greenscreen', 'welcome', 'chroma-key'],
                prompt: 'Ruby Rhino in a welcoming pose captured on a miniature stop-motion stage with chroma-key green backdrop...'
            },
            {
                id: 'bundle_006',
                title: 'Maxine Mouse - Green Screen Alpha',
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMwMDAwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BbHBoYSBNYXNrPC90ZXh0Pjwvc3ZnPg==',
                metadata: {
                    character: 'maxine_mouse',
                    pose: 'seated_contemplative',
                    scene: 'greenscreen_v1',
                    lighting: 'lighting_002',
                    film_type: 'stop_motion',
                    texture: 'texture_001',
                    film_stock: 'fuji_superia_400',
                    camera: 'camera_005',
                    model: 't2i_model_x@0.9',
                    wardrobe: ['spectacles'],
                    props: ['book'],
                    film_bible: 'film_bible@1.0.0',
                    vocabulary_version: 'lexicon@v1',
                    bundle_type: 'greenscreen_dual',
                    output_mode: 'greenscreen_dual',
                    tape_markings: false,
                    chroma_key: {
                        color: '#00FF00',
                        tolerance: 'standard'
                    },
                    spatial_metadata: {
                        character_origin: [0, 0, 0.1],
                        camera_position: [0, 0, 1.0],
                        stage_grid: '10cm'
                    },
                    created_at: '2025-10-24T11:45:22.000Z',
                    status: 'completed',
                    approved: false
                },
                tags: ['mouse', 'greenscreen', 'alpha', 'seated'],
                prompt: 'Maxine Mouse in a contemplative seated pose with clean alpha channel cutout...'
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
        
        // Lighting codified scheme display
        this.setupLightingCodifiedDisplay();
        
        // Green-screen scene handling
        this.setupGreenScreenHandling();
        
        // Camera-tripod height auto-sync
        this.setupCameraTripodSync();
        
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
        
        // Grid overlay toggle
        const gridOverlayBtn = document.getElementById('grid-overlay-btn');
        if (gridOverlayBtn) {
            gridOverlayBtn.addEventListener('click', () => {
                this.toggleGridOverlay();
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
        
        // Navigation is now handled by separate pages, no mode switching needed
        
        // Assemble mode functionality
        const generateBundlesBtn = document.getElementById('generate-bundles-btn');
        const previewPromptBtn = document.getElementById('preview-prompt-btn');
        
        if (generateBundlesBtn) {
            generateBundlesBtn.addEventListener('click', () => this.generateBundles());
        }
        
        if (previewPromptBtn) {
            previewPromptBtn.addEventListener('click', () => this.previewPrompt());
        }
        
        // Reset to defaults button
        const resetDefaultsBtn = document.getElementById('reset-defaults-btn');
        if (resetDefaultsBtn) {
            resetDefaultsBtn.addEventListener('click', () => this.resetToDefaults());
        }
        
        // Reset filters button
        const resetFiltersBtn = document.getElementById('reset-filters-btn');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => this.resetFilters());
        }
        
        // Project management event listeners
        this.setupProjectManagementListeners();
    }
    
    setupFloatingToolsListeners() {
        // Floating Tools menu toggle
        const toolsToggle = document.getElementById('tools-toggle');
        const toolsMenu = document.getElementById('tools-menu');
        const toolsClose = document.getElementById('tools-close');
        
        if (toolsToggle && toolsMenu) {
            toolsToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleToolsMenu();
            });
        }
        
        if (toolsClose && toolsMenu) {
            toolsClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeToolsMenu();
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (toolsMenu && toolsMenu.classList.contains('show') && 
                !toolsMenu.contains(e.target) && 
                !toolsToggle.contains(e.target)) {
                this.closeToolsMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && toolsMenu && toolsMenu.classList.contains('show')) {
                this.closeToolsMenu();
            }
        });
    }
    
    toggleToolsMenu() {
        const toolsMenu = document.getElementById('tools-menu');
        if (toolsMenu) {
            toolsMenu.classList.toggle('show');
        }
    }
    
    closeToolsMenu() {
        const toolsMenu = document.getElementById('tools-menu');
        if (toolsMenu) {
            toolsMenu.classList.remove('show');
        }
    }
    
    setupProjectManagementListeners() {
        // Project dropdown change - auto-load project settings
        const projectSelect = document.getElementById('project-default');
        if (projectSelect) {
            projectSelect.addEventListener('change', (e) => {
                const projectName = e.target.value;
                this.projectManager.currentProject = projectName;
                this.projectManager.loadProject(projectName);
            });
        }
        
        // Create new project button
        const createProjectBtn = document.getElementById('create-project-btn');
        if (createProjectBtn) {
            createProjectBtn.addEventListener('click', () => {
                const projectName = document.getElementById('new-project-name').value;
                if (this.projectManager.createNewProject(projectName)) {
                    document.getElementById('new-project-name').value = '';
                }
            });
        }
        
        // Load project button (explicit load)
        const loadProjectBtn = document.getElementById('load-project-btn');
        if (loadProjectBtn) {
            loadProjectBtn.addEventListener('click', () => {
                const projectName = document.getElementById('project-default').value;
                this.projectManager.loadProject(projectName);
            });
        }
        
        // Delete project button
        const deleteProjectBtn = document.getElementById('delete-project-btn');
        if (deleteProjectBtn) {
            deleteProjectBtn.addEventListener('click', () => {
                const projectName = document.getElementById('project-default').value;
                if (confirm(`Are you sure you want to delete project "${projectName}"?`)) {
                    this.projectManager.deleteProject(projectName);
                }
            });
        }
        
        // Upload project file
        const uploadProjectFile = document.getElementById('upload-project-file');
        if (uploadProjectFile) {
            uploadProjectFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.projectManager.uploadProjectFile(file).then((projectName) => {
                        document.getElementById('project-default').value = projectName;
                        this.projectManager.currentProject = projectName;
                        e.target.value = ''; // Clear the file input
                    }).catch((error) => {
                        console.error('Error uploading project file:', error);
                    });
                }
            });
        }
        
        // Section save buttons
        const sectionSaveBtns = document.querySelectorAll('.section-save-btn');
        sectionSaveBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionName = e.target.dataset.section;
                this.projectManager.saveSectionToProject(sectionName);
            });
        });
        
        // Master save all settings button
        const saveAllSettingsBtn = document.getElementById('save-all-settings-btn');
        if (saveAllSettingsBtn) {
            saveAllSettingsBtn.addEventListener('click', () => {
                this.projectManager.saveAllSettingsToProject();
            });
        }
    }
    
    setupLightingCodifiedDisplay() {
        // Lighting filter (browse mode)
        const lightingFilter = document.getElementById('lighting-filter');
        if (lightingFilter) {
            lightingFilter.addEventListener('change', (e) => {
                this.updateLightingCodifiedDisplay('lighting-filter', 'lighting-codified-display', 'lighting-codified-text');
            });
        }
        
        // Assemble lighting (assemble mode)
        const assembleLighting = document.getElementById('assemble-lighting');
        if (assembleLighting) {
            assembleLighting.addEventListener('change', (e) => {
                this.updateLightingCodifiedDisplay('assemble-lighting', 'assemble-lighting-codified-display', 'assemble-lighting-codified-text');
            });
        }
    }
    
    setupGreenScreenHandling() {
        // Green-screen scene selection listener
        const sceneSelect = document.getElementById('assemble-scene');
        if (sceneSelect) {
            sceneSelect.addEventListener('change', (e) => {
                this.updateTapeMarkingsVisibility();
            });
        }
        
        // Tape markings checkbox listener
        const tapeMarkingsCheckbox = document.getElementById('assemble-tape-markings');
        if (tapeMarkingsCheckbox) {
            tapeMarkingsCheckbox.addEventListener('change', (e) => {
                // Handle tape markings toggle if needed
                console.log('Tape markings toggled:', e.target.checked);
            });
        }
    }
    
    setupCameraTripodSync() {
        // Camera-to-tripod height mapping (canonical heights)
        this.cameraHeightMapping = {
            'camera_001': '1.0',  // Eye-level
            'camera_002': '0.75', // 3/4 Height
            'camera_003': '0.5',  // Low Angle
            'camera_004': '1.5',  // High Angle
            'camera_005': '1.0',  // 3/4 Left
            'camera_006': '1.0',  // 3/4 Right
            'camera_007': '1.0',  // Profile
            'camera_008': '1.0',  // Back 3/4
            'camera_009': '1.0',  // 50mm Portrait
            'camera_010': '1.0'   // 24mm Wide
        };
        
        // Camera selection listener for auto-sync
        const cameraSelect = document.getElementById('assemble-camera');
        const tripodHeightSelect = document.getElementById('assemble-tripod-height');
        
        if (cameraSelect && tripodHeightSelect) {
            cameraSelect.addEventListener('change', (e) => {
                this.syncTripodHeightToCamera(e.target.value);
            });
            
            // Initialize with default camera selection
            this.syncTripodHeightToCamera(cameraSelect.value);
        }
    }
    
    syncTripodHeightToCamera(cameraValue) {
        const tripodHeightSelect = document.getElementById('assemble-tripod-height');
        if (!tripodHeightSelect) return;
        
        const canonicalHeight = this.cameraHeightMapping[cameraValue];
        if (canonicalHeight) {
            // Set the tripod height to the canonical value
            tripodHeightSelect.value = canonicalHeight;
            // Disable the dropdown to indicate it's auto-managed
            tripodHeightSelect.disabled = true;
        } else {
            // If no camera selected, enable the dropdown
            tripodHeightSelect.disabled = false;
        }
    }
    
    updateTapeMarkingsVisibility() {
        const sceneSelect = document.getElementById('assemble-scene');
        const tapeMarkingsSection = document.getElementById('tape-markings-section');
        
        if (!sceneSelect || !tapeMarkingsSection) return;
        
        const selectedScene = sceneSelect.value;
        
        if (selectedScene === 'greenscreen_v1') {
            tapeMarkingsSection.style.display = 'block';
        } else {
            tapeMarkingsSection.style.display = 'none';
        }
    }
    
    // Helper method to get filter values with default handling
    getFilterValue(elementId, defaultValue) {
        const element = document.getElementById(elementId);
        if (!element) return defaultValue;
        
        const value = element.value;
        if (value === 'default') {
            return defaultValue;
        }
        return value || defaultValue;
    }
    
    updateLightingCodifiedDisplay(selectId, displayId, textId) {
        const select = document.getElementById(selectId);
        const display = document.getElementById(displayId);
        const textElement = document.getElementById(textId);
        
        if (!select || !display || !textElement) return;
        
        const selectedValue = select.value;
        
        // Lighting phrases mapping
        const lightingPhrases = {
            'lighting_001': 'Warm, directional late-afternoon sunlight from front-left at 45°, soft fill light from right, subtle floor shadow, gently contrasted stop-motion studio lighting.',
            'lighting_002': 'Soft, even overhead lighting with 360° ambient fill, minimal shadows, warm tungsten tone, cozy stop-motion studio atmosphere.',
            'lighting_003': 'Sharp, dramatic lighting from front-left at 30°, minimal back fill, defined shadows with high contrast, cinematic stop-motion studio lighting.',
            'lighting_004': 'Clean, even overhead lighting with 360° fill, soft even shadows, neutral color temperature, professional stop-motion studio lighting.',
            'lighting_005': 'Warm sunset backlight from back-right at 60°, soft warm fill from front, elongated soft shadows, golden hour stop-motion studio lighting.',
            'lighting_006': 'Cool moonlight from front-left at 15°, minimal cool fill, soft defined shadows, blue-tinted stop-motion studio lighting.',
            'lighting_007': 'Warm candlelight from front-left at 45°, soft warm ambient from below, flickering soft shadows, intimate stop-motion studio lighting.',
            'lighting_008': 'Bright daylight from front-left at 30°, strong fill from right, moderate shadows, natural stop-motion studio lighting.',
            'lighting_009': 'Diffused overcast lighting from overhead, 360° soft fill, minimal contrast, natural stop-motion studio lighting.',
            'lighting_010': 'Warm firelight from front-left at 30°, soft warm ambient from below, dancing soft shadows, cozy stop-motion studio lighting.'
        };
        
        if (selectedValue === 'all' || !lightingPhrases[selectedValue]) {
            display.style.display = 'none';
        } else {
            textElement.textContent = lightingPhrases[selectedValue];
            display.style.display = 'block';
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
        
        // Tenner orientation selection listener
        const tennerOrientationSelect = document.getElementById('tenner-orientation');
        if (tennerOrientationSelect) {
            tennerOrientationSelect.addEventListener('change', () => {
                this.updateCustomOrientationVisibility();
            });
        }
    }
    
    setupPaletteListeners() {
        // Palette mode toggle listeners
        const paletteModeRadios = document.querySelectorAll('input[name="palette-mode"]');
        paletteModeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updatePaletteMode();
            });
        });
        
        // Standard palette selection listener
        const paletteSelect = document.getElementById('assemble-color-palette');
        if (paletteSelect) {
            paletteSelect.addEventListener('change', () => {
                this.updateColorSwatches();
            });
        }
        
        // Color usage mode toggle listeners
        const colorUsageRadios = document.querySelectorAll('input[name="color-usage-mode"]');
        colorUsageRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateColorUsageMode();
            });
        });
        
        // Custom palette file upload listener
        const customPaletteFile = document.getElementById('custom-palette-file');
        if (customPaletteFile) {
            customPaletteFile.addEventListener('change', (e) => {
                this.handleCustomPaletteUpload(e);
            });
        }
        
        // Single color selection listener (backward compatibility)
        const singleColorSelect = document.getElementById('assemble-color-single');
        if (singleColorSelect) {
            singleColorSelect.addEventListener('change', () => {
                // This will be handled in prompt generation
            });
        }
        
        // Initialize with default palette
        this.updatePaletteMode();
        this.updateColorSwatches();
    }
    
    updatePaletteMode() {
        const mode = document.querySelector('input[name="palette-mode"]:checked')?.value || 'standard';
        
        // Hide all sections
        document.getElementById('standard-palette-section').style.display = 'none';
        document.getElementById('custom-palette-section').style.display = 'none';
        document.getElementById('single-color-section').style.display = 'none';
        
        // Show selected section
        switch (mode) {
            case 'standard':
                document.getElementById('standard-palette-section').style.display = 'block';
                break;
            case 'custom':
                document.getElementById('custom-palette-section').style.display = 'block';
                break;
            case 'single':
                document.getElementById('single-color-section').style.display = 'block';
                break;
        }
        
        // Update color swatches if standard mode
        if (mode === 'standard') {
            this.updateColorSwatches();
        }
    }
    
    updateColorSwatches() {
        const paletteSelect = document.getElementById('assemble-color-palette');
        const swatchesContainer = document.getElementById('color-swatches');
        
        if (!paletteSelect || !swatchesContainer) return;
        
        const selectedPalette = paletteSelect.value;
        const palettes = this.getColorPalettes();
        const palette = palettes[selectedPalette];
        
        if (!palette) return;
        
        // Clear existing swatches
        swatchesContainer.innerHTML = '';
        
        // Create color swatches
        palette.colors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.dataset.colorIndex = index;
            swatch.innerHTML = `
                <div class="color-swatch-circle" style="background-color: ${color.hex}"></div>
                <div class="color-swatch-name">${color.name}</div>
            `;
            
            // Add click listener for individual selection
            swatch.addEventListener('click', () => {
                this.toggleColorSelection(swatch, index);
            });
            
            swatchesContainer.appendChild(swatch);
        });
        
        // Update individual color selection checkboxes
        this.updateIndividualColorSelection(palette);
    }
    
    updateIndividualColorSelection(palette) {
        const container = document.getElementById('individual-color-selection');
        if (!container) return;
        
        // Clear existing checkboxes
        container.innerHTML = '';
        
        // Create checkboxes for each color
        palette.colors.forEach((color, index) => {
            const checkbox = document.createElement('div');
            checkbox.className = 'color-checkbox';
            checkbox.innerHTML = `
                <label class="color-checkbox-label">
                    <input type="checkbox" name="selected-colors" value="${index}" checked>
                    <div class="color-checkbox-swatch" style="background-color: ${color.hex}"></div>
                    <span>${color.name}</span>
                </label>
            `;
            
            // Add change listener
            const checkboxInput = checkbox.querySelector('input[type="checkbox"]');
            checkboxInput.addEventListener('change', () => {
                this.updateColorSwatchSelection(index, checkboxInput.checked);
            });
            
            container.appendChild(checkbox);
        });
    }
    
    updateColorUsageMode() {
        const mode = document.querySelector('input[name="color-usage-mode"]:checked')?.value || 'all';
        const individualSelection = document.getElementById('individual-color-selection');
        
        if (individualSelection) {
            individualSelection.style.display = mode === 'select' ? 'block' : 'none';
        }
        
        // Update swatch selection state
        if (mode === 'all') {
            // Select all colors
            const checkboxes = document.querySelectorAll('input[name="selected-colors"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
                const index = parseInt(checkbox.value);
                this.updateColorSwatchSelection(index, true);
            });
        }
    }
    
    toggleColorSelection(swatch, index) {
        const checkbox = document.querySelector(`input[name="selected-colors"][value="${index}"]`);
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            this.updateColorSwatchSelection(index, checkbox.checked);
        }
    }
    
    updateColorSwatchSelection(index, selected) {
        const swatch = document.querySelector(`[data-color-index="${index}"]`);
        if (swatch) {
            if (selected) {
                swatch.classList.add('selected');
            } else {
                swatch.classList.remove('selected');
            }
        }
    }
    
    async handleCustomPaletteUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const preview = document.getElementById('custom-palette-preview');
        const swatchesContainer = document.getElementById('custom-color-swatches');
        
        try {
            let colors = [];
            
            if (file.type.startsWith('image/')) {
                colors = await this.extractColorsFromImage(file);
            } else if (file.name.endsWith('.json')) {
                colors = await this.parseJSONPalette(file);
            } else if (file.name.endsWith('.txt')) {
                colors = await this.parseTextPalette(file);
            } else {
                throw new Error('Unsupported file type');
            }
            
            // Display the colors
            this.displayCustomPalette(colors, swatchesContainer);
            preview.style.display = 'block';
            
        } catch (error) {
            console.error('Error processing palette file:', error);
            alert('Error processing palette file: ' + error.message);
        }
    }
    
    async extractColorsFromImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const colors = this.getDominantColors(imageData);
                resolve(colors);
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }
    
    getDominantColors(imageData) {
        const data = imageData.data;
        const colorCounts = {};
        
        // Sample every 10th pixel for performance
        for (let i = 0; i < data.length; i += 40) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            
            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }
        
        // Get top 6 colors
        const sortedColors = Object.entries(colorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .map(([hex], index) => ({
                name: `Color ${index + 1}`,
                hex: hex
            }));
        
        return sortedColors;
    }
    
    async parseJSONPalette(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const colors = Array.isArray(data) ? data : data.colors || [];
                    resolve(colors);
                } catch (error) {
                    reject(new Error('Invalid JSON format'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
    
    async parseTextPalette(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const lines = e.target.result.split('\n');
                    const colors = lines
                        .filter(line => line.trim())
                        .slice(0, 8) // Limit to 8 colors
                        .map((line, index) => {
                            const hex = line.trim();
                            if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                                throw new Error(`Invalid hex color: ${hex}`);
                            }
                            return {
                                name: `Color ${index + 1}`,
                                hex: hex
                            };
                        });
                    resolve(colors);
                } catch (error) {
                    reject(new Error('Invalid text format: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
    
    displayCustomPalette(colors, container) {
        container.innerHTML = '';
        
        colors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.innerHTML = `
                <div class="color-swatch-circle" style="background-color: ${color.hex}"></div>
                <div class="color-swatch-name">${color.name}</div>
            `;
            container.appendChild(swatch);
        });
    }
    
    getCurrentColorPalette() {
        const mode = document.querySelector('input[name="palette-mode"]:checked')?.value || 'standard';
        
        switch (mode) {
            case 'standard':
                return this.getStandardPaletteColors();
            case 'custom':
                return this.getCustomPaletteColors();
            case 'single':
                return this.getSingleColor();
            default:
                return [];
        }
    }
    
    getStandardPaletteColors() {
        const paletteSelect = document.getElementById('assemble-color-palette');
        const usageMode = document.querySelector('input[name="color-usage-mode"]:checked')?.value || 'all';
        
        if (!paletteSelect) return [];
        
        const selectedPalette = paletteSelect.value;
        const palettes = this.getColorPalettes();
        const palette = palettes[selectedPalette];
        
        if (!palette) return [];
        
        if (usageMode === 'all') {
            return palette.colors;
        } else {
            // Get selected colors only
            const selectedCheckboxes = document.querySelectorAll('input[name="selected-colors"]:checked');
            return Array.from(selectedCheckboxes).map(checkbox => {
                const index = parseInt(checkbox.value);
                return palette.colors[index];
            }).filter(Boolean);
        }
    }
    
    getCustomPaletteColors() {
        // For custom palettes, we would need to store the uploaded colors
        // For now, return empty array - this would need to be implemented
        // when custom palette storage is added
        return [];
    }
    
    getSingleColor() {
        const singleColorSelect = document.getElementById('assemble-color-single');
        if (!singleColorSelect) return [];
        
        const selectedColor = singleColorSelect.value;
        if (selectedColor === 'all') return [];
        
        // Convert single color selection to palette format
        const colorMap = {
            'ochre': { name: 'ochre', hex: '#CC7722' },
            'cream': { name: 'cream', hex: '#F5F5DC' },
            'soft-pink': { name: 'soft pink', hex: '#F8BBD9' },
            'muted-blue': { name: 'muted blue', hex: '#6B8E9A' }
        };
        
        return colorMap[selectedColor] ? [colorMap[selectedColor]] : [];
    }
    
    updateTennerMode() {
        const mode = document.querySelector('input[name="tenner-mode"]:checked')?.value || 'single';
        
        // Update status and options when mode changes
        this.updateTennerStatus();
        this.updateTennerOptions();
        this.updateTennerSpecificOptions();
    }
    
    updateTennerSpecificOptions() {
        const mode = document.querySelector('input[name="tenner-mode"]:checked')?.value || 'single';
        
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
        const mode = document.querySelector('input[name="tenner-mode"]:checked')?.value || 'single';
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
    
    updateCustomOrientationVisibility() {
        const tennerOrientation = document.getElementById('tenner-orientation')?.value || '';
        const customOrientationInput = document.getElementById('custom-orientation-input');
        
        if (!customOrientationInput) return;
        
        if (tennerOrientation === 'custom') {
            // Show custom orientation input
            customOrientationInput.style.display = 'block';
        } else {
            // Hide custom orientation input
            customOrientationInput.style.display = 'none';
        }
    }
    
    
    filterRenders() {
        const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
        const poseFilter = this.getFilterValue('pose-filter', 'all');
        const sceneFilterManual = document.getElementById('scene-filter-manual')?.value.trim();
        const sceneFilter = sceneFilterManual || this.getFilterValue('scene-filter', 'all');
        const lightingFilter = this.getFilterValue('lighting-filter', 'all');
        const filmTypeFilter = this.getFilterValue('film-type-filter', 'all');
        const textureFilter = this.getFilterValue('texture-filter', 'all');
        const filmStockFilter = this.getFilterValue('film-stock-filter', 'all');
        const cameraFilter = this.getFilterValue('camera-filter', 'all');
        const wardrobeFilter = this.getFilterValue('wardrobe-filter', 'all');
        const propsFilter = this.getFilterValue('props-filter', 'all');
        const statusFilter = this.getFilterValue('status-filter', 'all');
        const filmBibleFilter = this.getFilterValue('film-bible-filter', 'all');
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
        
        // Only render gallery and pagination on browse page
        if (document.getElementById('gallery')) {
            this.renderGallery();
            this.renderPagination();
        }
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
        
        // Update grid overlay if visible
        if (this.gridOverlayVisible) {
            this.updateGridOverlay();
        }
    }
    
    renderCard(render) {
        const statusClass = render.metadata.approved ? 'approved' : 'pending';
        const statusIcon = render.metadata.approved ? '✅' : '⏳';
        const isGreenScreen = render.metadata.scene === 'greenscreen_v1';
        const greenScreenBadge = isGreenScreen ? '<span class="greenscreen-badge">🎬 Green-Screen</span>' : '';
        
        return `
            <div class="render-card ${isGreenScreen ? 'greenscreen-card' : ''}" data-render-id="${render.id}">
                <div class="render-image">
                    <img src="${render.image}" alt="${render.title}" loading="lazy">
                    ${greenScreenBadge}
                </div>
                <div class="render-info">
                    <div class="render-title">${render.title} ${greenScreenBadge}</div>
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
                        ${isGreenScreen ? `<button class="btn btn-sm btn-info" onclick="viewer.previewComposite('${render.id}')">
                            🎬 Preview Composite
                        </button>` : ''}
                        ${isGreenScreen ? `<div class="download-options">
                            <button class="btn btn-sm btn-success" onclick="viewer.downloadGreenscreen('${render.id}')">
                                📥 Green-Screen
                            </button>
                            <button class="btn btn-sm btn-success" onclick="viewer.downloadAlpha('${render.id}')">
                                🔳 Alpha
                            </button>
                            <button class="btn btn-sm btn-success" onclick="viewer.downloadBoth('${render.id}')">
                                📦 Both (ZIP)
                            </button>
                        </div>` : ''}
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
    
    toggleGridOverlay() {
        this.gridOverlayVisible = !this.gridOverlayVisible;
        this.updateGridOverlay();
        this.updateGridOverlayButton();
    }
    
    updateGridOverlay() {
        const renderCards = document.querySelectorAll('.render-card');
        renderCards.forEach(card => {
            const imageContainer = card.querySelector('.render-image');
            if (!imageContainer) return;
            
            // Remove existing grid overlay
            const existingGrid = imageContainer.querySelector('.grid-overlay');
            if (existingGrid) {
                existingGrid.remove();
            }
            
            if (this.gridOverlayVisible) {
                // Add grid overlay
                const gridOverlay = document.createElement('div');
                gridOverlay.className = 'grid-overlay';
                gridOverlay.innerHTML = this.createGridHTML();
                imageContainer.appendChild(gridOverlay);
            }
        });
    }
    
    createGridHTML() {
        // Create 10cm x 10cm grid overlay based on Virtual Stage System
        return `
            <div class="grid-lines">
                <div class="grid-line horizontal" style="top: 25%"></div>
                <div class="grid-line horizontal" style="top: 50%"></div>
                <div class="grid-line horizontal" style="top: 75%"></div>
                <div class="grid-line vertical" style="left: 25%"></div>
                <div class="grid-line vertical" style="left: 50%"></div>
                <div class="grid-line vertical" style="left: 75%"></div>
            </div>
            <div class="grid-markers">
                <div class="center-marker" style="top: 50%; left: 50%"></div>
                <div class="character-origin" style="top: 50%; left: 50%"></div>
            </div>
            <div class="grid-labels">
                <div class="grid-label" style="top: 5px; left: 5px;">Stage Grid (10cm)</div>
                <div class="grid-label" style="bottom: 5px; right: 5px;">Character Origin (0,0,0.1)</div>
            </div>
        `;
    }
    
    updateGridOverlayButton() {
        const gridBtn = document.getElementById('grid-overlay-btn');
        if (!gridBtn) return;
        
        if (this.gridOverlayVisible) {
            gridBtn.textContent = '📐 Hide Grid';
            gridBtn.classList.add('active');
        } else {
            gridBtn.textContent = '📐 Grid Overlay';
            gridBtn.classList.remove('active');
        }
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
    
    // Mode switching methods removed - now handled by separate pages
    
    // Assemble mode methods
    generateBundles() {
        const assemblyType = document.querySelector('input[name="assembly-type"]:checked').value;
        const pose = document.getElementById('assemble-pose').value;
        const sceneManual = document.getElementById('assemble-scene-manual')?.value.trim();
        const scene = sceneManual || this.getFilterValue('assemble-scene', 'piazza_v2');
        const lighting = this.getFilterValue('assemble-lighting', 'lighting_001');
        const wardrobe = this.getFilterValue('assemble-wardrobe', 'none');
        const props = this.getFilterValue('assemble-props', 'none');
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
        
        // Check if green-screen scene is selected
        const isGreenScreen = scene === 'greenscreen_v1';
        const tapeMarkings = document.getElementById('assemble-tape-markings')?.checked || false;
        
        logContent += `⚙️ Settings:\n`;
        logContent += `   Output Directory: ${outputDir}\n`;
        logContent += `   Verbose: ${verbose ? 'Yes' : 'No'}\n`;
        
        if (isGreenScreen) {
            logContent += `   🎬 Green-Screen Mode: Dual Output\n`;
            logContent += `   📐 Tape Markings: ${tapeMarkings ? 'Enabled' : 'Disabled'}\n`;
            logContent += `   🎨 Chroma Key: #00FF00 (Standard Broadcast Green)\n`;
        }
        
        logContent += `\n`;
        
        if (isGreenScreen) {
            logContent += `✅ Green-Screen Bundle generation complete!\n`;
            logContent += `📁 Files saved to: ${outputDir}/\n`;
            logContent += `📊 Generated ${count} bundle(s) with dual outputs:\n`;
            logContent += `   🎬 Green-screen plates: bundle_xxx_greenscreen.png\n`;
            logContent += `   🔳 Alpha masks: bundle_xxx_alpha.png\n`;
            logContent += `   📋 Metadata: bundle_xxx.json\n`;
        } else {
            logContent += `✅ Bundle generation complete!\n`;
            logContent += `📁 Files saved to: ${outputDir}/\n`;
            logContent += `📊 Generated ${count} bundle(s) successfully\n`;
        }
        
        outputLog.textContent = logContent;
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    previewPrompt() {
        // Only process pose if pose fields are visible
        let pose = '';
        let orientation = '';
        const tennerPoseElement = document.getElementById('tenner-pose');
        const tennerOrientationElement = document.getElementById('tenner-orientation');
        const assemblePoseElement = document.getElementById('assemble-pose');
        
        // Check if pose fields are visible and have values
        if (tennerPoseElement && tennerPoseElement.offsetParent !== null) {
            const tennerPose = tennerPoseElement.value || '';
            if (tennerPose) {
                if (tennerPose === 'custom') {
                    const customPoseText = document.getElementById('custom-pose-text')?.value || '';
                    pose = customPoseText.trim() || 'custom pose';
                } else {
                    pose = tennerPose;
                }
            }
            
            // Handle orientation
            if (tennerOrientationElement && tennerOrientationElement.offsetParent !== null) {
                const tennerOrientation = tennerOrientationElement.value || '';
                if (tennerOrientation) {
                    if (tennerOrientation === 'custom') {
                        const customOrientationText = document.getElementById('custom-orientation-text')?.value || '';
                        orientation = customOrientationText.trim() || 'custom orientation';
                    } else {
                        orientation = tennerOrientation;
                    }
                }
            }
        } else if (assemblePoseElement && assemblePoseElement.offsetParent !== null) {
            const assemblePose = assemblePoseElement.value || '';
            if (assemblePose) {
                pose = assemblePose;
            }
        }
        
        const sceneManual = document.getElementById('assemble-scene-manual')?.value.trim();
        const scene = sceneManual || this.getFilterValue('assemble-scene', 'piazza_v2');
        const lighting = this.getFilterValue('assemble-lighting', 'lighting_001');
        const filmType = this.getFilterValue('assemble-film-type', 'stop_motion');
        const texture = this.getFilterValue('assemble-texture', 'texture_001');
        const filmStock = this.getFilterValue('assemble-film-stock', 'kodak_portra_400');
        const camera = this.getFilterValue('assemble-camera', 'camera_001');
        // Get tripod height from camera mapping (auto-synced)
        const tripodHeight = this.cameraHeightMapping[camera] || '1.0';
        const wardrobe = this.getFilterValue('assemble-wardrobe', 'none');
        const props = this.getFilterValue('assemble-props', 'none');
        
        // Output parameters
        const outputWidth = this.getFilterValue('output-width', '1024');
        const outputHeight = this.getFilterValue('output-height', '1024');
        const outputAspectRatio = this.getFilterValue('output-aspect-ratio', '16:9');
        const outputQuality = this.getFilterValue('output-quality', 'high');
        const outputFormat = this.getFilterValue('output-format', 'png');
        const outputColorSpace = this.getFilterValue('output-color-space', 'sRGB');
        
        // Generate preview prompt
        let prompt;
        
        // Check for T1 character selection first
        let characterName = 'A character';
        const tenner1Specific = document.getElementById('tenner-1-specific')?.value || '';
        if (tenner1Specific) {
            // Parse T1 selection: "T1-0: rhino named Ruby"
            const match = tenner1Specific.match(/^T1-\d+:\s*(.+)$/);
            if (match) {
                characterName = match[1]; // Use the actual character name
            }
        }
        
        if (pose) {
            // Check if it's a custom pose (from custom text input)
            const customPoseText = document.getElementById('custom-pose-text')?.value || '';
            if (tennerPoseElement && tennerPoseElement.offsetParent !== null && 
                tennerPoseElement.value === 'custom' && customPoseText.trim()) {
                // For custom poses, use the text directly
                prompt = `${characterName} ${pose}`;
            } else {
                // For predefined poses, add "in a [pose] pose"
                prompt = `${characterName} in a ${pose.replace('_', ' ')} pose`;
            }
        } else {
            // No pose specified, use character name
            prompt = characterName;
        }
        
        // Add orientation if specified
        if (orientation) {
            // Check if it's a custom orientation (from custom text input)
            const customOrientationText = document.getElementById('custom-orientation-text')?.value || '';
            if (tennerOrientationElement && tennerOrientationElement.offsetParent !== null && 
                tennerOrientationElement.value === 'custom' && customOrientationText.trim()) {
                // For custom orientations, use the text directly
                prompt += `, ${orientation}`;
            } else {
                // For predefined orientations, add orientation description
                prompt += `, ${orientation.replace('_', ' ')} orientation`;
            }
        }
        
        if (scene !== 'all') {
            if (scene === 'greenscreen_v1') {
                // Special handling for green-screen scene
                const tapeMarkings = document.getElementById('assemble-tape-markings')?.checked || false;
                prompt += ` captured on a miniature stop-motion stage with chroma-key green backdrop. Floor: vibrant green (#00FF00) matte surface. Wall: vibrant green (#00FF00) matte surface. 90-degree junction visible. Character maintains felted wool texture with natural contact shadows falling on green floor`;
                
                if (tapeMarkings) {
                    prompt += `. White T-mark tape at center stage position. Yellow spike tape strips marking character positions. Subtle reference marks at stage corners. Tape markings appear as physical elements on green floor`;
                }
            } else {
                prompt += ` at a ${scene.replace('_', ' ')}`;
            }
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
        
        // Add color palette directive
        const colorPalette = this.getCurrentColorPalette();
        if (colorPalette && colorPalette.length > 0) {
            const colorNames = colorPalette.map(color => color.name).join(', ');
            prompt += ` with ${colorNames} color palette`;
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
        
        // Add camera system description (tripod height will be injected dynamically)
        const cameraDescriptions = {
            'camera_001': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height {HEIGHT}, angled 0° downward, positioned at stage center',
            'camera_002': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height {HEIGHT}, angled 5° downward, positioned at stage center',
            'camera_003': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height {HEIGHT}, angled 10° upward, positioned at stage center',
            'camera_004': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height {HEIGHT}, angled 5° downward, positioned at stage center',
            'camera_005': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height {HEIGHT}, angled 0° downward, positioned at stage center, camera rotated 45° left',
            'camera_006': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height {HEIGHT}, angled 0° downward, positioned at stage center, camera rotated 45° right',
            'camera_007': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height {HEIGHT}, angled 0° downward, positioned at stage center, camera rotated 90° left',
            'camera_008': 'Captured on a miniature stop-motion stage using a fixed camera at 35mm lens, tripod height {HEIGHT}, angled 0° downward, positioned at stage center, camera rotated 135° left',
            'camera_009': 'Captured on a miniature stop-motion stage using a fixed camera at 50mm lens, tripod height {HEIGHT}, angled 0° downward, positioned at stage center',
            'camera_010': 'Captured on a miniature stop-motion stage using a fixed camera at 24mm lens, tripod height {HEIGHT}, angled 0° downward, positioned at stage center'
        };
        
        if (camera && cameraDescriptions[camera]) {
            const heightText = tripodHeight === '1.0' ? '1 meter' : `${tripodHeight} meters`;
            const cameraDescription = cameraDescriptions[camera].replace('{HEIGHT}', heightText);
            prompt += `. ${cameraDescription}`;
        }
        
        // Handle Tenner information separately (not included in main prompt)
        const mode = document.querySelector('input[name="tenner-mode"]:checked')?.value || 'single';
        const tenner1 = document.getElementById('tenner-1')?.value || '';
        const tenner2 = document.getElementById('tenner-2')?.value || '';
        const tenner3 = document.getElementById('tenner-3')?.value || '';
        
        const selectedTenners = [tenner1, tenner2, tenner3].filter(t => t !== '' && t !== 'none');
        
        // Store Tenner information for separate display
        let tennerInfo = null;
        
        // Integrate Tenner selections using real data from JSON
        if (selectedTenners.length > 0) {
            if (!this.tennerData || !this.tennerData.categories) {
                console.warn('⚠️ No Tenner data available for prompt assembly');
            } else {
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
                    
                    // Prepare Tenner info for separate display
                    if (selectedSpecifics.length > 0) {
                        tennerInfo = `Single Mode: ${selectedTenners.join(', ')} - ${selectedSpecifics.join(', ')}`;
                    } else {
                        tennerInfo = `Single Mode: ${selectedTenners.join(', ')} (specific options not selected)`;
                    }
                } else {
                    // In batch mode, show permutation counts
                    const permutationCount = Math.pow(10, selectedTenners.length);
                    tennerInfo = `Batch Mode: ${selectedTenners.join(', ')} (${permutationCount} permutations)`;
                }
            }
        }
        
        // Add output parameters with conflict resolution
        if (outputWidth !== 'custom' && outputHeight !== 'custom') {
            prompt += `, ${outputWidth}x${outputHeight} pixels`;
        }
        
        // Only add aspect ratio if it matches the actual dimensions
        if (outputAspectRatio !== 'custom') {
            const width = parseInt(outputWidth);
            const height = parseInt(outputHeight);
            const [ratioW, ratioH] = outputAspectRatio.split(':').map(Number);
            const actualRatio = width / height;
            const expectedRatio = ratioW / ratioH;
            
            // Only add aspect ratio if it matches (within 0.01 tolerance)
            if (Math.abs(actualRatio - expectedRatio) < 0.01) {
                prompt += `, ${outputAspectRatio} aspect ratio`;
            }
        }
        
        if (outputQuality !== 'standard') {
            prompt += `, ${outputQuality} quality`;
        }
        
        if (outputFormat !== 'png') {
            prompt += `, ${outputFormat.toUpperCase()} format`;
        }
        
        if (outputColorSpace !== 'sRGB') {
            prompt += `, ${outputColorSpace} color space`;
        }
        
        prompt += `, 3D stop-motion style, high quality, detailed`;
        
        // Show preview in modal
        this.showPromptPreviewModal(prompt, tennerInfo);
    }
    
    showPromptPreviewModal(prompt, tennerInfo = null) {
        const modal = document.getElementById('prompt-preview-modal');
        const textarea = document.getElementById('prompt-preview-text');
        const wordCount = document.getElementById('prompt-word-count');
        const charCount = document.getElementById('prompt-char-count');
        const tokenEstimate = document.getElementById('prompt-token-estimate');
        const tennerPreviewInfo = document.getElementById('tenner-preview-info');
        const tennerPreviewContent = document.getElementById('tenner-preview-content');
        
        if (!modal || !textarea) {
            console.error('Prompt preview modal elements not found');
            return;
        }
        
        // Set the prompt text
        textarea.value = prompt;
        
        // Handle Tenner information display
        if (tennerInfo && tennerPreviewInfo && tennerPreviewContent) {
            tennerPreviewContent.innerHTML = `<p><strong>Mode:</strong> ${tennerInfo}</p>`;
            tennerPreviewInfo.style.display = 'block';
        } else if (tennerPreviewInfo) {
            tennerPreviewInfo.style.display = 'none';
        }
        
        // Calculate statistics
        const words = prompt.trim().split(/\s+/).filter(word => word.length > 0).length;
        const characters = prompt.length;
        const tokens = Math.ceil(characters / 4); // Rough estimate: 4 chars per token
        
        // Update statistics
        wordCount.textContent = `Words: ${words}`;
        charCount.textContent = `Characters: ${characters}`;
        tokenEstimate.textContent = `~Tokens: ${tokens}`;
        
        // Show the modal
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus on the textarea for easy selection
        setTimeout(() => {
            textarea.focus();
            textarea.select();
        }, 100);
    }
    
    hidePromptPreviewModal() {
        const modal = document.getElementById('prompt-preview-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
        }
        
        const textarea = document.getElementById('prompt-preview-text');
        if (textarea) {
            textarea.value = '';
        }
        
        const tennerPreviewInfo = document.getElementById('tenner-preview-info');
        if (tennerPreviewInfo) {
            tennerPreviewInfo.style.display = 'none';
        }
    }
    
    async copyPromptToClipboard(includeFormatting = false) {
        const textarea = document.getElementById('prompt-preview-text');
        if (!textarea) return false;
        
        try {
            let textToCopy = textarea.value;
            
            if (includeFormatting) {
                // Add some basic formatting for better readability
                textToCopy = `🎨 Anamalia Prompt:\n\n${textToCopy}\n\n---\nGenerated by Anamalia Prompt Assembler`;
            }
            
            await navigator.clipboard.writeText(textToCopy);
            return true;
        } catch (err) {
            console.error('Failed to copy text: ', err);
            return false;
        }
    }
    
    showCopySuccess(button) {
        const originalText = button.textContent;
        const originalClass = button.className;
        
        button.textContent = '✓ Copied!';
        button.className = originalClass + ' copy-success';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.className = originalClass;
        }, 2000);
    }
    
    initPromptPreviewModal() {
        const modal = document.getElementById('prompt-preview-modal');
        const closeBtn = document.getElementById('prompt-preview-close');
        const copyBtn = document.getElementById('copy-prompt-btn');
        const copyFormattingBtn = document.getElementById('copy-prompt-with-formatting-btn');
        
        if (!modal) return;
        
        // Close modal handlers
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePromptPreviewModal());
        }
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hidePromptPreviewModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.hidePromptPreviewModal();
            }
        });
        
        // Copy button handlers
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const success = await this.copyPromptToClipboard(false);
                if (success) {
                    this.showCopySuccess(copyBtn);
                } else {
                    alert('Failed to copy to clipboard. Please try again.');
                }
            });
        }
        
        if (copyFormattingBtn) {
            copyFormattingBtn.addEventListener('click', async () => {
                const success = await this.copyPromptToClipboard(true);
                if (success) {
                    this.showCopySuccess(copyFormattingBtn);
                } else {
                    alert('Failed to copy to clipboard. Please try again.');
                }
            });
        }
    }
    
    initOutputParameterSync() {
        const widthSelect = document.getElementById('output-width');
        const heightSelect = document.getElementById('output-height');
        const aspectRatioSelect = document.getElementById('output-aspect-ratio');
        
        if (!widthSelect || !heightSelect || !aspectRatioSelect) return;
        
        // Sync when aspect ratio changes
        aspectRatioSelect.addEventListener('change', () => {
            this.syncDimensionsToAspectRatio();
        });
        
        // Sync when width/height changes
        widthSelect.addEventListener('change', () => {
            this.syncAspectRatioToDimensions();
        });
        
        heightSelect.addEventListener('change', () => {
            this.syncAspectRatioToDimensions();
        });
        
        // Set up film stock and camera validation
        this.initFilmCameraValidation();
    }
    
    syncDimensionsToAspectRatio() {
        const aspectRatio = document.getElementById('output-aspect-ratio').value;
        const widthSelect = document.getElementById('output-width');
        const heightSelect = document.getElementById('output-height');
        
        if (aspectRatio === 'custom') return;
        
        const currentWidth = parseInt(widthSelect.value) || 1024;
        const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
        
        // Calculate new height based on aspect ratio
        const newHeight = Math.round((currentWidth * ratioH) / ratioW);
        
        // Find closest available height option
        const heightOptions = Array.from(heightSelect.options).map(opt => parseInt(opt.value)).filter(val => !isNaN(val));
        const closestHeight = heightOptions.reduce((prev, curr) => 
            Math.abs(curr - newHeight) < Math.abs(prev - newHeight) ? curr : prev
        );
        
        heightSelect.value = closestHeight.toString();
    }
    
    syncAspectRatioToDimensions() {
        const width = parseInt(document.getElementById('output-width').value);
        const height = parseInt(document.getElementById('output-height').value);
        const aspectRatioSelect = document.getElementById('output-aspect-ratio');
        
        if (isNaN(width) || isNaN(height)) return;
        
        const ratio = width / height;
        let closestRatio = 'custom'; // default to custom
        let minDiff = Infinity;
        
        // Find closest aspect ratio
        const ratios = {
            '1:1': 1.0,
            '4:3': 4/3,
            '16:9': 16/9,
            '3:2': 3/2,
            '21:9': 21/9,
            '9:16': 9/16
        };
        
        for (const [ratioStr, ratioVal] of Object.entries(ratios)) {
            const diff = Math.abs(ratio - ratioVal);
            if (diff < minDiff) {
                minDiff = diff;
                closestRatio = ratioStr;
            }
        }
        
        // If the closest match is still too far off (more than 0.05 difference), use custom
        if (minDiff > 0.05) {
            closestRatio = 'custom';
        }
        
        aspectRatioSelect.value = closestRatio;
    }
    
    async loadTennerData() {
        try {
            console.log('📊 Loading Tenner data from JSON...');
            
            const response = await fetch('new_tenner_options.json');
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
            console.log('📊 T1 data:', this.tennerData.categories['T1']);
            console.log('📊 Available categories:', Object.keys(this.tennerData.categories));
            
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
    
    // Composite Modal functionality
    setupCompositeModalListeners() {
        // Close modal listeners
        const closeBtn = document.getElementById('composite-modal-close');
        const modal = document.getElementById('composite-modal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideCompositeModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideCompositeModal();
                }
            });
        }
        
        // Background loading
        const loadBtn = document.getElementById('load-background');
        const resetBtn = document.getElementById('reset-composite');
        const fileInput = document.getElementById('background-upload');
        const urlInput = document.getElementById('background-url');
        
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadBackgroundImage());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetComposite());
        }
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.loadBackgroundFromFile(e.target.files[0]);
                }
            });
        }
        
        if (urlInput) {
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.loadBackgroundImage();
                }
            });
        }
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
            'scene-filter-manual': {
                title: 'Manual Scene Entry',
                content: `
                    <h4>Custom Scene Description</h4>
                    <p>Enter a custom scene description to override the predefined scene options. This allows you to specify unique environments not covered by the standard scenes.</p>
                    <p><strong>Examples:</strong></p>
                    <ul>
                        <li>"A cozy coffee shop with warm lighting and wooden furniture"</li>
                        <li>"A futuristic laboratory with clean white surfaces and blue accent lighting"</li>
                        <li>"A medieval castle courtyard with stone walls and torch lighting"</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>💡 Tip:</strong> Be descriptive about lighting, materials, and architectural elements for best results.</p>
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
            'tenner-orientation': {
                title: 'Character Orientation',
                content: `
                    <h4>Character Orientations</h4>
                    <p>Orientations define the camera angle and character positioning relative to the viewer. Each orientation creates different visual perspectives and storytelling effects.</p>
                    <ul>
                        <li><strong>Three Quarter Left:</strong> Classic 3/4 view from the left, most common for character shots</li>
                        <li><strong>Three Quarter Right:</strong> 3/4 view from the right, alternative character angle</li>
                        <li><strong>Front:</strong> Direct face-on view, formal and symmetrical</li>
                        <li><strong>Profile Left/Right:</strong> Side view, dramatic and clean silhouettes</li>
                        <li><strong>Back Three Quarter:</strong> Behind and to the side, mysterious or contemplative</li>
                        <li><strong>Back:</strong> Completely behind, creates intrigue or distance</li>
                        <li><strong>Custom:</strong> Create your own unique orientation description</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>📐 Camera Angles:</strong> Orientations control how the character is viewed. Choose angles that enhance your composition and storytelling.</p>
                    </div>
                `
            },
            'custom-orientation-text': {
                title: 'Custom Orientation',
                content: `
                    <h4>Custom Orientation Description</h4>
                    <p>Enter a detailed description of the character's orientation and camera angle. Be specific about positioning and perspective.</p>
                    <div class="highlight">
                        <p><strong>💡 Examples:</strong> "slight left turn, looking up", "three-quarter view with head tilted", "profile view with over-shoulder angle"</p>
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
            
            'project-default': {
                title: 'Project Selection',
                content: `
                    <h4>Project Defaults</h4>
                    <p>Select the project template that will be used as the foundation for your prompt generation. Each project has its own set of default settings and configurations.</p>
                    
                    <h5>📋 Available Projects</h5>
                    <ul>
                        <li><strong>Anamalia Password:</strong> The main Anamalia character stills project with anthropomorphic animal characters, stop-motion aesthetic, and password-derived variations</li>
                    </ul>
                    
                    <div class="highlight">
                        <p><strong>⚙️ Project Templates:</strong> Each project template includes predefined settings for camera, lighting, materials, and style that can be customized as needed.</p>
                    </div>
                `
            },
            
            'assemble-color': {
                title: 'Color Palette Selection',
                content: `
                    <h4>Color Palette System</h4>
                    <p>Choose from standard predefined palettes, upload custom palettes, or use single colors. Each palette contains 5-8 carefully curated colors that work harmoniously together.</p>
                    
                    <h5>🎨 Standard Palettes</h5>
                    <ul>
                        <li><strong>Classic Anamalia:</strong> Original ochre, cream, soft pink, muted blue</li>
                        <li><strong>Warm Earth Tones:</strong> Terracotta, rust, sandy beige, warm brown, burnt orange</li>
                        <li><strong>Cool Pastels:</strong> Powder blue, mint green, lavender, pale yellow, soft coral</li>
                        <li><strong>Autumn Harvest:</strong> Deep orange, golden yellow, burgundy, forest green, chocolate brown</li>
                        <li><strong>Spring Meadow:</strong> Grass green, sky blue, buttercup yellow, rose pink, lilac</li>
                        <li><strong>Ocean Depths:</strong> Teal, navy, seafoam, coral, sand beige</li>
                        <li><strong>Sunset Glow:</strong> Coral pink, peach, golden yellow, deep purple, soft orange</li>
                        <li><strong>Forest Canopy:</strong> Moss green, sage, bark brown, olive, forest green</li>
                        <li><strong>Desert Bloom:</strong> Cactus green, dusty rose, sand, copper, pale turquoise</li>
                        <li><strong>Winter Frost:</strong> Ice blue, silver gray, white, pale lavender, soft mint</li>
                    </ul>
                    
                    <h5>📁 Custom Palette Upload</h5>
                    <ul>
                        <li><strong>Image Files (PNG/JPG):</strong> Automatically extracts dominant colors</li>
                        <li><strong>JSON Files:</strong> Structured color array with names and hex codes</li>
                        <li><strong>Text Files:</strong> Simple list of hex codes (one per line)</li>
                    </ul>
                    
                    <h5>⚙️ Usage Modes</h5>
                    <ul>
                        <li><strong>Use All Colors:</strong> Includes all palette colors in the prompt</li>
                        <li><strong>Select Specific Colors:</strong> Choose individual colors from the palette</li>
                    </ul>
                    
                    <div class="highlight">
                        <p><strong>🎨 Color Harmony:</strong> Palettes ensure cohesive color relationships and establish the visual mood and emotional tone of each composition.</p>
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
            'assemble-scene-manual': {
                title: 'Manual Scene Entry',
                content: `
                    <h4>Custom Scene Description</h4>
                    <p>Enter a custom scene description to override the predefined scene options. This allows you to specify unique environments not covered by the standard scenes.</p>
                    <p><strong>Examples:</strong></p>
                    <ul>
                        <li>"A cozy coffee shop with warm lighting and wooden furniture"</li>
                        <li>"A futuristic laboratory with clean white surfaces and blue accent lighting"</li>
                        <li>"A medieval castle courtyard with stone walls and torch lighting"</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>💡 Tip:</strong> Be descriptive about lighting, materials, and architectural elements for best results.</p>
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
            },
            'output-width': {
                title: 'Output Width',
                content: `
                    <h4>Image Width in Pixels</h4>
                    <p>Set the horizontal resolution of your generated images. Higher values create more detailed images but require more processing time.</p>
                    <ul>
                        <li><strong>512px:</strong> Small, fast generation, good for thumbnails</li>
                        <li><strong>768px:</strong> Medium size, balanced quality and speed</li>
                        <li><strong>1024px:</strong> Standard high quality (recommended)</li>
                        <li><strong>1280px:</strong> Large format, detailed images</li>
                        <li><strong>1536px:</strong> Very large, maximum detail</li>
                        <li><strong>2048px:</strong> Ultra high resolution, professional quality</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>💡 Tip:</strong> Use 1024px for most applications. Higher resolutions are best for print or large displays.</p>
                    </div>
                `
            },
            'output-height': {
                title: 'Output Height',
                content: `
                    <h4>Image Height in Pixels</h4>
                    <p>Set the vertical resolution of your generated images. Should match your width for proper aspect ratios.</p>
                    <ul>
                        <li><strong>512px:</strong> Small, fast generation</li>
                        <li><strong>768px:</strong> Medium size, balanced quality</li>
                        <li><strong>1024px:</strong> Standard high quality (recommended)</li>
                        <li><strong>1280px:</strong> Large format, detailed images</li>
                        <li><strong>1536px:</strong> Very large, maximum detail</li>
                        <li><strong>2048px:</strong> Ultra high resolution</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>📐 Note:</strong> Height should complement your width choice for the desired aspect ratio.</p>
                    </div>
                `
            },
            'output-aspect-ratio': {
                title: 'Aspect Ratio',
                content: `
                    <h4>Image Aspect Ratio</h4>
                    <p>Choose the proportional relationship between width and height. Different ratios suit different purposes.</p>
                    <ul>
                        <li><strong>Square (1:1):</strong> Perfect for social media, profile pictures</li>
                        <li><strong>Standard (4:3):</strong> Classic photography, traditional displays</li>
                        <li><strong>Widescreen (16:9):</strong> Modern displays, video content</li>
                        <li><strong>Classic (3:2):</strong> Traditional photography, print media</li>
                        <li><strong>Ultrawide (21:9):</strong> Cinematic, panoramic views</li>
                        <li><strong>Portrait (9:16):</strong> Mobile displays, vertical content</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🎬 Tip:</strong> 16:9 is ideal for most modern displays, while 1:1 works great for social media.</p>
                    </div>
                `
            },
            'output-quality': {
                title: 'Output Quality',
                content: `
                    <h4>Image Quality Settings</h4>
                    <p>Control the level of detail and processing quality for your generated images.</p>
                    <ul>
                        <li><strong>Standard:</strong> Good quality, fast generation</li>
                        <li><strong>High:</strong> Excellent quality, balanced processing (recommended)</li>
                        <li><strong>Ultra:</strong> Maximum quality, longer processing time</li>
                        <li><strong>Lossless:</strong> Perfect quality, very slow generation</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>⚡ Performance:</strong> Higher quality settings require more processing time but produce better results.</p>
                    </div>
                `
            },
            'output-format': {
                title: 'Output Format',
                content: `
                    <h4>Image File Format</h4>
                    <p>Choose the file format for your generated images. Each format has different characteristics and use cases.</p>
                    <ul>
                        <li><strong>PNG:</strong> Lossless compression, supports transparency, best for graphics</li>
                        <li><strong>JPEG:</strong> Lossy compression, smaller file sizes, best for photos</li>
                        <li><strong>WebP:</strong> Modern format, excellent compression, web-optimized</li>
                        <li><strong>TIFF:</strong> Professional format, lossless, large file sizes</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>💾 Recommendation:</strong> PNG for graphics and transparency, JPEG for photos and web use.</p>
                    </div>
                `
            },
            'output-color-space': {
                title: 'Color Space',
                content: `
                    <h4>Color Space Selection</h4>
                    <p>Choose the color space that defines the range of colors available in your images.</p>
                    <ul>
                        <li><strong>sRGB:</strong> Standard web color space, most compatible</li>
                        <li><strong>Adobe RGB:</strong> Wider color gamut, professional photography</li>
                        <li><strong>P3:</strong> Apple's wide color space, modern displays</li>
                        <li><strong>Rec. 2020:</strong> Ultra-wide color space, HDR content</li>
                    </ul>
                    <div class="highlight">
                        <p><strong>🌈 Note:</strong> sRGB is recommended for web use, while Adobe RGB is better for print.</p>
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
    
    // Composite Modal methods
    previewComposite(renderId) {
        const render = this.renders.find(r => r.id === renderId);
        if (!render || render.metadata.scene !== 'greenscreen_v1') {
            alert('This render is not a green-screen render.');
            return;
        }
        
        this.currentCompositeRender = render;
        this.showCompositeModal();
    }
    
    showCompositeModal() {
        const modal = document.getElementById('composite-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            this.resetComposite();
        }
    }
    
    hideCompositeModal() {
        const modal = document.getElementById('composite-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            this.currentCompositeRender = null;
        }
    }
    
    resetComposite() {
        const canvas = document.getElementById('composite-canvas');
        if (!canvas || !this.currentCompositeRender) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the green-screen character
        const characterImg = new Image();
        characterImg.onload = () => {
            ctx.drawImage(characterImg, 0, 0, canvas.width, canvas.height);
        };
        characterImg.src = this.currentCompositeRender.image;
    }
    
    loadBackgroundImage() {
        const urlInput = document.getElementById('background-url');
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('Please enter a background image URL.');
            return;
        }
        
        this.loadBackgroundFromURL(url);
    }
    
    loadBackgroundFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.compositeImages(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    loadBackgroundFromURL(url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this.compositeImages(url);
        };
        img.onerror = () => {
            alert('Failed to load background image. Please check the URL.');
        };
        img.src = url;
    }
    
    compositeImages(backgroundSrc) {
        const canvas = document.getElementById('composite-canvas');
        if (!canvas || !this.currentCompositeRender) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const bgImg = new Image();
        bgImg.onload = () => {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
            
            // Draw green-screen character with chroma key
            const characterImg = new Image();
            characterImg.onload = () => {
                // Simple chroma key: replace green pixels with transparency
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = characterImg.width;
                tempCanvas.height = characterImg.height;
                
                tempCtx.drawImage(characterImg, 0, 0);
                const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                const data = imageData.data;
                
                // Simple green screen removal (replace green pixels with transparent)
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Check if pixel is green (simple threshold)
                    if (g > r && g > b && g > 100) {
                        data[i + 3] = 0; // Set alpha to 0 (transparent)
                    }
                }
                
                tempCtx.putImageData(imageData, 0, 0);
                ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
            };
            characterImg.src = this.currentCompositeRender.image;
        };
        bgImg.src = backgroundSrc;
    }
    
    // Download methods for green-screen renders
    downloadGreenscreen(renderId) {
        const render = this.renders.find(r => r.id === renderId);
        if (!render || render.metadata.scene !== 'greenscreen_v1') {
            alert('This render is not a green-screen render.');
            return;
        }
        
        // In a real implementation, this would download the actual green-screen file
        // For now, we'll simulate by downloading the current image
        this.downloadImage(render.image, `${render.id}_greenscreen.png`);
    }
    
    downloadAlpha(renderId) {
        const render = this.renders.find(r => r.id === renderId);
        if (!render || render.metadata.scene !== 'greenscreen_v1') {
            alert('This render is not a green-screen render.');
            return;
        }
        
        // In a real implementation, this would download the actual alpha mask file
        // For now, we'll simulate by downloading a placeholder
        this.downloadImage(render.image, `${render.id}_alpha.png`);
    }
    
    downloadBoth(renderId) {
        const render = this.renders.find(r => r.id === renderId);
        if (!render || render.metadata.scene !== 'greenscreen_v1') {
            alert('This render is not a green-screen render.');
            return;
        }
        
        // In a real implementation, this would create a ZIP file with both images
        // For now, we'll download both files separately
        this.downloadImage(render.image, `${render.id}_greenscreen.png`);
        setTimeout(() => {
            this.downloadImage(render.image, `${render.id}_alpha.png`);
        }, 500);
        
        // Also download metadata
        this.downloadMetadata(render, `${render.id}_metadata.json`);
    }
    
    downloadImage(imageSrc, filename) {
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    downloadMetadata(render, filename) {
        const metadata = {
            ...render.metadata,
            download_timestamp: new Date().toISOString(),
            download_type: 'green_screen_metadata'
        };
        
        const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
    
    // Reset methods for default settings
    resetToDefaults() {
        // Reset all assemble mode fields to their default values
        const defaultValues = {
            'output-width': '1024',
            'output-height': '1024',
            'output-aspect-ratio': '16:9',
            'output-quality': 'high',
            'output-format': 'png',
            'output-color-space': 'sRGB',
            'tenner-1': '',
            'tenner-2': '',
            'tenner-3': '',
            'tenner-pose': 'arms_open_welcome',
            'tenner-orientation': 'three_quarter_left',
            'assemble-texture': 'texture_001',
            'assemble-material': 'all',
            'assemble-color-palette': 'anamalia_late_summer',
            'assemble-color-single': 'all',
            'assemble-composition': 'all',
            'assemble-tone': 'all',
            'assemble-scene': 'piazza_v2',
            'assemble-wardrobe': 'none',
            'assemble-props': 'none',
            'assemble-lighting': 'lighting_001',
            'assemble-film-type': 'stop_motion',
            'assemble-film-stock': 'kodak_portra_400',
            'assemble-camera': 'camera_001'
        };
        
        // Apply default values
        Object.entries(defaultValues).forEach(([fieldId, defaultValue]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = defaultValue;
            }
        });
        
        // Reset tape markings section visibility
        this.updateTapeMarkingsVisibility();
        
        // Show success message
        this.showSuccess('All fields reset to default values');
    }
    
    resetFilters() {
        // Reset all browse mode filters to their default values
        const defaultValues = {
            'scene-filter': 'all',
            'props-filter': 'all',
            'wardrobe-filter': 'all',
            'lighting-filter': 'all',
            'film-type-filter': 'all',
            'film-stock-filter': 'all',
            'camera-filter': 'all',
            'status-filter': 'all',
            'pose-filter': 'all',
            'texture-filter': 'all',
            'film-bible-filter': 'all',
            'material-filter': 'all',
            'light-filter': 'all',
            'color-filter': 'all',
            'composition-filter': 'all',
            'tone-filter': 'all',
            'bundle-type-filter': 'all',
            'date-range-filter': 'all'
        };
        
        // Apply default values
        Object.entries(defaultValues).forEach(([fieldId, defaultValue]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = defaultValue;
            }
        });
        
        // Clear search
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Clear manual scene entry
        const sceneManualInput = document.getElementById('scene-filter-manual');
        if (sceneManualInput) {
            sceneManualInput.value = '';
        }
        
        // Reset grid overlay if visible
        if (this.gridOverlayVisible) {
            this.toggleGridOverlay();
        }
        
        // Re-filter renders
        this.filterRenders();
        
        // Show success message
        this.showSuccess('All filters reset to default values');
    }
    
    showSuccess(message) {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: 500;
        `;
        
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
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
    
    initFilmCameraValidation() {
        const filmStockSelect = document.getElementById('assemble-film-stock');
        const cameraSelect = document.getElementById('assemble-camera');
        
        if (!filmStockSelect || !cameraSelect) return;
        
        // Add event listeners for validation
        filmStockSelect.addEventListener('change', () => {
            this.validateFilmCameraCompatibility();
            this.suggestCompatibleCamera();
        });
        
        cameraSelect.addEventListener('change', () => {
            this.validateFilmCameraCompatibility();
            this.suggestCompatibleFilmStock();
        });
    }
    
    validateFilmCameraCompatibility() {
        const filmStock = document.getElementById('assemble-film-stock')?.value;
        const camera = document.getElementById('assemble-camera')?.value;
        
        if (!filmStock || !camera || filmStock === 'all' || camera === 'all') return;
        
        const conflicts = this.getFilmCameraConflicts(filmStock, camera);
        
        if (conflicts.length > 0) {
            this.showCompatibilityWarning(conflicts);
        } else {
            this.hideCompatibilityWarning();
        }
    }
    
    getFilmCameraConflicts(filmStock, camera) {
        const conflicts = [];
        
        // Black & white film conflicts
        const bwFilms = ['ilford_hp5_400', 'kodak_tmax_100'];
        if (bwFilms.includes(filmStock)) {
            // Check if camera description mentions color
            const cameraDescriptions = this.getCameraDescriptions();
            const cameraDesc = cameraDescriptions[camera] || '';
            
            if (cameraDesc.includes('color') || cameraDesc.includes('warm') || cameraDesc.includes('saturated')) {
                conflicts.push({
                    type: 'bw_color_mismatch',
                    message: `Black & white film (${filmStock.replace('_', ' ')}) selected with camera that may emphasize color characteristics`,
                    severity: 'warning'
                });
            }
        }
        
        // Film speed vs lighting conflicts
        const slowFilms = ['fuji_velvia_50', 'kodak_tmax_100']; // ISO 50-100
        const fastFilms = ['cinestill_800t']; // ISO 800+
        
        if (slowFilms.includes(filmStock)) {
            // Check for low-light camera angles
            const lowLightAngles = ['camera_003', 'camera_004']; // Low angle, high angle
            if (lowLightAngles.includes(camera)) {
                conflicts.push({
                    type: 'speed_lighting_mismatch',
                    message: `Slow film (${filmStock.replace('_', ' ')}) may not perform well with dramatic lighting angles`,
                    severity: 'info'
                });
            }
        }
        
        if (fastFilms.includes(filmStock)) {
            // Check for bright lighting scenarios
            const brightLightAngles = ['camera_001', 'camera_002']; // Standard, 3/4 height
            if (brightLightAngles.includes(camera)) {
                conflicts.push({
                    type: 'speed_lighting_mismatch',
                    message: `Fast film (${filmStock.replace('_', ' ')}) may be overkill for standard lighting conditions`,
                    severity: 'info'
                });
            }
        }
        
        // Color temperature conflicts
        const tungstenFilms = ['cinestill_800t'];
        const coolFilms = ['fuji_superia_400'];
        
        if (tungstenFilms.includes(filmStock)) {
            // Tungsten film works best with warm lighting
            const coolLightingCameras = ['camera_003', 'camera_004']; // May suggest cooler lighting
            if (coolLightingCameras.includes(camera)) {
                conflicts.push({
                    type: 'color_temp_mismatch',
                    message: `Tungsten-balanced film (${filmStock.replace('_', ' ')}) works best with warm lighting conditions`,
                    severity: 'warning'
                });
            }
        }
        
        return conflicts;
    }
    
    suggestCompatibleCamera() {
        const filmStock = document.getElementById('assemble-film-stock')?.value;
        if (!filmStock || filmStock === 'all') return;
        
        const suggestions = this.getCompatibleCameras(filmStock);
        if (suggestions.length > 0) {
            this.showCompatibilitySuggestion('camera', suggestions);
        }
    }
    
    suggestCompatibleFilmStock() {
        const camera = document.getElementById('assemble-camera')?.value;
        if (!camera || camera === 'all') return;
        
        const suggestions = this.getCompatibleFilmStocks(camera);
        if (suggestions.length > 0) {
            this.showCompatibilitySuggestion('film', suggestions);
        }
    }
    
    getCompatibleCameras(filmStock) {
        const compatibility = {
            'kodak_portra_400': ['camera_001', 'camera_002', 'camera_009'], // Standard, portrait-friendly
            'kodak_ultramax_400': ['camera_001', 'camera_002', 'camera_005', 'camera_006'], // Good for vibrant colors
            'fuji_superia_400': ['camera_001', 'camera_002', 'camera_003'], // Cool tones work well
            'ilford_hp5_400': ['camera_001', 'camera_002', 'camera_007', 'camera_008'], // B&W classic angles
            'kodak_gold_200': ['camera_001', 'camera_002', 'camera_009'], // Warm, portrait-friendly
            'fuji_velvia_50': ['camera_001', 'camera_002', 'camera_010'], // Ultra-saturated, wide angle
            'kodak_tmax_100': ['camera_001', 'camera_002', 'camera_007', 'camera_008'], // B&W fine grain
            'agfa_vista_200': ['camera_001', 'camera_002', 'camera_009'], // Natural colors
            'lomography_color_400': ['camera_003', 'camera_004', 'camera_005', 'camera_006'], // Vintage, creative angles
            'cinestill_800t': ['camera_001', 'camera_002', 'camera_003', 'camera_004'] // Tungsten, dramatic lighting
        };
        
        return compatibility[filmStock] || [];
    }
    
    getCompatibleFilmStocks(camera) {
        const compatibility = {
            'camera_001': ['kodak_portra_400', 'kodak_gold_200', 'agfa_vista_200'], // Standard - versatile films
            'camera_002': ['kodak_portra_400', 'kodak_gold_200', 'agfa_vista_200'], // 3/4 height - versatile
            'camera_003': ['fuji_superia_400', 'lomography_color_400', 'cinestill_800t'], // Low angle - dramatic
            'camera_004': ['fuji_superia_400', 'lomography_color_400', 'cinestill_800t'], // High angle - dramatic
            'camera_005': ['kodak_ultramax_400', 'lomography_color_400'], // 3/4 left - creative
            'camera_006': ['kodak_ultramax_400', 'lomography_color_400'], // 3/4 right - creative
            'camera_007': ['ilford_hp5_400', 'kodak_tmax_100'], // Profile - B&W classic
            'camera_008': ['ilford_hp5_400', 'kodak_tmax_100'], // Back 3/4 - B&W classic
            'camera_009': ['kodak_portra_400', 'kodak_gold_200', 'agfa_vista_200'], // 50mm portrait
            'camera_010': ['fuji_velvia_50', 'kodak_ultramax_400'] // 24mm wide - landscape/wide
        };
        
        return compatibility[camera] || [];
    }
    
    showCompatibilityWarning(conflicts) {
        // Remove existing warning
        this.hideCompatibilityWarning();
        
        const warningDiv = document.createElement('div');
        warningDiv.id = 'film-camera-warning';
        warningDiv.className = 'compatibility-warning';
        warningDiv.innerHTML = `
            <div class="warning-header">
                <span class="warning-icon">⚠️</span>
                <strong>Film/Camera Compatibility Warning</strong>
            </div>
            <div class="warning-content">
                ${conflicts.map(conflict => `
                    <div class="conflict-item ${conflict.severity}">
                        <span class="conflict-icon">${conflict.severity === 'warning' ? '⚠️' : 'ℹ️'}</span>
                        ${conflict.message}
                    </div>
                `).join('')}
            </div>
        `;
        
        // Insert after the camera section
        const cameraSection = document.querySelector('#assemble-camera').closest('.filter-group');
        if (cameraSection) {
            cameraSection.insertAdjacentElement('afterend', warningDiv);
        }
    }
    
    hideCompatibilityWarning() {
        const existingWarning = document.getElementById('film-camera-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
    }
    
    showCompatibilitySuggestion(type, suggestions) {
        // Remove existing suggestion
        this.hideCompatibilitySuggestion();
        
        const suggestionDiv = document.createElement('div');
        suggestionDiv.id = 'film-camera-suggestion';
        suggestionDiv.className = 'compatibility-suggestion';
        
        const currentValue = type === 'camera' ? 
            document.getElementById('assemble-camera')?.value : 
            document.getElementById('assemble-film-stock')?.value;
        
        if (suggestions.includes(currentValue)) {
            // Current selection is already compatible
            return;
        }
        
        const suggestionText = type === 'camera' ? 'camera' : 'film stock';
        const options = type === 'camera' ? this.getCameraOptions() : this.getFilmStockOptions();
        
        suggestionDiv.innerHTML = `
            <div class="suggestion-header">
                <span class="suggestion-icon">💡</span>
                <strong>Compatible ${type === 'camera' ? 'Camera' : 'Film Stock'} Suggestions</strong>
            </div>
            <div class="suggestion-content">
                <p>For better compatibility, consider these ${suggestionText} options:</p>
                <ul>
                    ${suggestions.map(suggestion => `
                        <li>${options[suggestion] || suggestion}</li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        // Insert after the warning (if it exists) or after the camera section
        const warningDiv = document.getElementById('film-camera-warning');
        const insertAfter = warningDiv || document.querySelector('#assemble-camera').closest('.filter-group');
        
        if (insertAfter) {
            insertAfter.insertAdjacentElement('afterend', suggestionDiv);
        }
    }
    
    hideCompatibilitySuggestion() {
        const existingSuggestion = document.getElementById('film-camera-suggestion');
        if (existingSuggestion) {
            existingSuggestion.remove();
        }
    }
    
    getCameraOptions() {
        return {
            'camera_001': '35mm Eye-level (Canonical)',
            'camera_002': '35mm 3/4 Height',
            'camera_003': '35mm Low Angle',
            'camera_004': '35mm High Angle',
            'camera_005': '35mm 3/4 Left',
            'camera_006': '35mm 3/4 Right',
            'camera_007': '35mm Profile',
            'camera_008': '35mm Back 3/4',
            'camera_009': '50mm Portrait',
            'camera_010': '24mm Wide'
        };
    }
    
    getFilmStockOptions() {
        return {
            'kodak_portra_400': 'Kodak Portra 400',
            'kodak_ultramax_400': 'Kodak Ultramax 400',
            'fuji_superia_400': 'Fuji Superia 400',
            'ilford_hp5_400': 'Ilford HP5 400',
            'kodak_gold_200': 'Kodak Gold 200',
            'fuji_velvia_50': 'Fuji Velvia 50',
            'kodak_tmax_100': 'Kodak T-Max 100',
            'agfa_vista_200': 'Agfa Vista 200',
            'lomography_color_400': 'Lomography Color 400',
            'cinestill_800t': 'Cinestill 800T'
        };
    }
    
    getCameraDescriptions() {
        return {
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
    }
    
    getColorPalettes() {
        return {
            'anamalia_late_summer': {
                name: 'Anamalia Late Summer Studio',
                colors: [
                    { name: 'Backdrop Cream', hex: '#F5F1E6' },
                    { name: 'Warm Beige Wash', hex: '#EADCC4' },
                    { name: 'Felt Gray Base', hex: '#8E8B84' },
                    { name: 'Felt Gray Highlight', hex: '#B5B2AB' },
                    { name: 'Felt Gray Shadow', hex: '#5E5B56' },
                    { name: 'Horn Ivory', hex: '#EDE7DA' },
                    { name: 'Eye Amber', hex: '#8C5A2B' },
                    { name: 'Iris Deep Ring', hex: '#4D2E16' },
                    { name: 'Natural Sclera', hex: '#F3F3F0' },
                    { name: 'Nose Slate', hex: '#3A3A3A' },
                    { name: 'Golden Hour Key', hex: '#F3C58B' },
                    { name: 'Soft Shadow Brown', hex: '#5A4636' }
                ]
            },
            'classic_anamalia': {
                name: 'Classic Anamalia',
                colors: [
                    { name: 'ochre', hex: '#CC7722' },
                    { name: 'cream', hex: '#F5F5DC' },
                    { name: 'soft pink', hex: '#F8BBD9' },
                    { name: 'muted blue', hex: '#6B8E9A' }
                ]
            },
            'warm_earth_tones': {
                name: 'Warm Earth Tones',
                colors: [
                    { name: 'terracotta', hex: '#E07856' },
                    { name: 'rust', hex: '#B7410E' },
                    { name: 'sandy beige', hex: '#F4E4BC' },
                    { name: 'warm brown', hex: '#8B4513' },
                    { name: 'burnt orange', hex: '#CC5500' },
                    { name: 'clay red', hex: '#CD5C5C' }
                ]
            },
            'cool_pastels': {
                name: 'Cool Pastels',
                colors: [
                    { name: 'powder blue', hex: '#B0E0E6' },
                    { name: 'mint green', hex: '#98FB98' },
                    { name: 'lavender', hex: '#E6E6FA' },
                    { name: 'pale yellow', hex: '#FFFFE0' },
                    { name: 'soft coral', hex: '#FF7F7F' },
                    { name: 'baby pink', hex: '#F8BBD9' }
                ]
            },
            'autumn_harvest': {
                name: 'Autumn Harvest',
                colors: [
                    { name: 'deep orange', hex: '#FF8C00' },
                    { name: 'golden yellow', hex: '#FFD700' },
                    { name: 'burgundy', hex: '#800020' },
                    { name: 'forest green', hex: '#228B22' },
                    { name: 'chocolate brown', hex: '#7B3F00' },
                    { name: 'amber', hex: '#FFBF00' }
                ]
            },
            'spring_meadow': {
                name: 'Spring Meadow',
                colors: [
                    { name: 'grass green', hex: '#7CFC00' },
                    { name: 'sky blue', hex: '#87CEEB' },
                    { name: 'buttercup yellow', hex: '#F0E68C' },
                    { name: 'rose pink', hex: '#FF69B4' },
                    { name: 'lilac', hex: '#C8A2C8' },
                    { name: 'fresh mint', hex: '#00FF7F' }
                ]
            },
            'ocean_depths': {
                name: 'Ocean Depths',
                colors: [
                    { name: 'teal', hex: '#008080' },
                    { name: 'navy', hex: '#000080' },
                    { name: 'seafoam', hex: '#9FE2BF' },
                    { name: 'coral', hex: '#FF7F50' },
                    { name: 'sand beige', hex: '#F4E4BC' },
                    { name: 'aqua', hex: '#00FFFF' }
                ]
            },
            'sunset_glow': {
                name: 'Sunset Glow',
                colors: [
                    { name: 'coral pink', hex: '#FF7F7F' },
                    { name: 'peach', hex: '#FFCBA4' },
                    { name: 'golden yellow', hex: '#FFD700' },
                    { name: 'deep purple', hex: '#4B0082' },
                    { name: 'soft orange', hex: '#FFA500' },
                    { name: 'rose gold', hex: '#E8B4B8' }
                ]
            },
            'forest_canopy': {
                name: 'Forest Canopy',
                colors: [
                    { name: 'moss green', hex: '#8A9A5B' },
                    { name: 'sage', hex: '#9CAF88' },
                    { name: 'bark brown', hex: '#8B4513' },
                    { name: 'olive', hex: '#808000' },
                    { name: 'forest green', hex: '#228B22' },
                    { name: 'pine green', hex: '#01796F' }
                ]
            },
            'desert_bloom': {
                name: 'Desert Bloom',
                colors: [
                    { name: 'cactus green', hex: '#4A6741' },
                    { name: 'dusty rose', hex: '#B76E79' },
                    { name: 'sand', hex: '#C2B280' },
                    { name: 'copper', hex: '#B87333' },
                    { name: 'pale turquoise', hex: '#AFEEEE' },
                    { name: 'sunset orange', hex: '#FD5E53' }
                ]
            },
            'winter_frost': {
                name: 'Winter Frost',
                colors: [
                    { name: 'ice blue', hex: '#B0E0E6' },
                    { name: 'silver gray', hex: '#C0C0C0' },
                    { name: 'white', hex: '#FFFFFF' },
                    { name: 'pale lavender', hex: '#E6E6FA' },
                    { name: 'soft mint', hex: '#98FB98' },
                    { name: 'frost blue', hex: '#87CEEB' }
                ]
            }
        };
    }
}

/**
 * Project Settings Manager
 * Handles saving and loading of project settings to/from JSON files
 */
class ProjectSettingsManager {
    constructor() {
        this.projects = new Map();
        this.currentProject = 'anamalia-password';
        this.init();
    }
    
    init() {
        // Initialize with default project
        this.projects.set('anamalia-password', {
            projectName: 'Anamalia Password',
            version: '1.0',
            lastModified: new Date().toISOString(),
            settings: this.getDefaultSettings()
        });
    }
    
    getDefaultSettings() {
        return {
            outputParameters: {
                width: '1024',
                height: '1024',
                aspectRatio: '16:9',
                quality: 'high',
                format: 'png',
                colorSpace: 'sRGB'
            },
            styleGuide: {
                texture: 'texture_001',
                material: 'all',
                paletteMode: 'standard',
                colorPalette: 'anamalia_late_summer',
                colorUsageMode: 'all',
                selectedColors: [],
                customPalette: null,
                composition: 'all',
                tone: 'all'
            },
            colorProfiles: {
                paletteMode: 'standard',
                colorPalette: 'anamalia_late_summer',
                colorUsageMode: 'all',
                selectedColors: [],
                customPalette: null,
                singleColor: 'default'
            },
            sceneGuide: {
                scene: 'piazza_v2',
                manualScene: '',
                tapeMarkings: false
            },
            wardrobe: {
                wardrobe: 'none',
                props: 'none'
            },
            moodLighting: {
                lighting: 'lighting_001',
                filmType: 'stop_motion',
                filmStock: 'kodak_portra_400',
                camera: 'camera_001',
                tripodHeight: '1.0'
            }
        };
    }
    
    // Settings Collection Functions
    collectOutputParametersSettings() {
        return {
            width: document.getElementById('output-width').value,
            height: document.getElementById('output-height').value,
            aspectRatio: document.getElementById('output-aspect-ratio').value,
            quality: document.getElementById('output-quality').value,
            format: document.getElementById('output-format').value,
            colorSpace: document.getElementById('output-color-space').value
        };
    }
    
    collectStyleGuideSettings() {
        const paletteMode = document.querySelector('input[name="palette-mode"]:checked')?.value || 'standard';
        const colorUsageMode = document.querySelector('input[name="color-usage-mode"]:checked')?.value || 'all';
        
        // Collect selected colors for individual selection mode
        const selectedColors = [];
        if (colorUsageMode === 'select') {
            const colorCheckboxes = document.querySelectorAll('#individual-color-selection input[type="checkbox"]:checked');
            colorCheckboxes.forEach(checkbox => {
                selectedColors.push(checkbox.value);
            });
        }
        
        return {
            texture: document.getElementById('assemble-texture').value,
            material: document.getElementById('assemble-material').value,
            paletteMode: paletteMode,
            colorPalette: document.getElementById('assemble-color-palette')?.value || 'anamalia_late_summer',
            colorUsageMode: colorUsageMode,
            selectedColors: selectedColors,
            customPalette: null, // TODO: Handle custom palette data
            composition: document.getElementById('assemble-composition').value,
            tone: document.getElementById('assemble-tone').value
        };
    }
    
    collectColorProfileSettings() {
        const paletteMode = document.querySelector('input[name="palette-mode"]:checked')?.value || 'standard';
        const colorUsageMode = document.querySelector('input[name="color-usage-mode"]:checked')?.value || 'all';
        
        // Collect selected colors for individual selection mode
        const selectedColors = [];
        if (colorUsageMode === 'select') {
            const colorCheckboxes = document.querySelectorAll('#individual-color-selection input[type="checkbox"]:checked');
            colorCheckboxes.forEach(checkbox => {
                selectedColors.push(checkbox.value);
            });
        }
        
        return {
            paletteMode: paletteMode,
            colorPalette: document.getElementById('assemble-color-palette')?.value || 'anamalia_late_summer',
            colorUsageMode: colorUsageMode,
            selectedColors: selectedColors,
            customPalette: null, // TODO: Handle custom palette data
            singleColor: document.getElementById('assemble-color-single')?.value || 'default'
        };
    }
    
    collectSceneGuideSettings() {
        return {
            scene: document.getElementById('assemble-scene').value,
            manualScene: document.getElementById('assemble-scene-manual').value,
            tapeMarkings: document.getElementById('assemble-tape-markings')?.checked || false
        };
    }
    
    collectWardrobeSettings() {
        return {
            wardrobe: document.getElementById('assemble-wardrobe').value,
            props: document.getElementById('assemble-props').value
        };
    }
    
    collectMoodLightingSettings() {
        return {
            lighting: document.getElementById('assemble-lighting').value,
            filmType: document.getElementById('assemble-film-type').value,
            filmStock: document.getElementById('assemble-film-stock').value,
            camera: document.getElementById('assemble-camera').value,
            tripodHeight: document.getElementById('assemble-tripod-height').value
        };
    }
    
    // Settings Application Functions
    applyOutputParametersSettings(settings) {
        if (settings.width) document.getElementById('output-width').value = settings.width;
        if (settings.height) document.getElementById('output-height').value = settings.height;
        if (settings.aspectRatio) document.getElementById('output-aspect-ratio').value = settings.aspectRatio;
        if (settings.quality) document.getElementById('output-quality').value = settings.quality;
        if (settings.format) document.getElementById('output-format').value = settings.format;
        if (settings.colorSpace) document.getElementById('output-color-space').value = settings.colorSpace;
    }
    
    applyStyleGuideSettings(settings) {
        if (settings.texture) document.getElementById('assemble-texture').value = settings.texture;
        if (settings.material) document.getElementById('assemble-material').value = settings.material;
        if (settings.composition) document.getElementById('assemble-composition').value = settings.composition;
        if (settings.tone) document.getElementById('assemble-tone').value = settings.tone;
        
        // Handle palette mode
        if (settings.paletteMode) {
            const paletteModeRadio = document.querySelector(`input[name="palette-mode"][value="${settings.paletteMode}"]`);
            if (paletteModeRadio) paletteModeRadio.checked = true;
        }
        
        // Handle color palette
        if (settings.colorPalette && document.getElementById('assemble-color-palette')) {
            document.getElementById('assemble-color-palette').value = settings.colorPalette;
        }
        
        // Handle color usage mode
        if (settings.colorUsageMode) {
            const colorUsageRadio = document.querySelector(`input[name="color-usage-mode"][value="${settings.colorUsageMode}"]`);
            if (colorUsageRadio) colorUsageRadio.checked = true;
        }
        
        // Handle selected colors
        if (settings.selectedColors && settings.selectedColors.length > 0) {
            settings.selectedColors.forEach(color => {
                const checkbox = document.querySelector(`#individual-color-selection input[value="${color}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }
    
    applyColorProfileSettings(settings) {
        // Handle palette mode
        if (settings.paletteMode) {
            const paletteModeRadio = document.querySelector(`input[name="palette-mode"][value="${settings.paletteMode}"]`);
            if (paletteModeRadio) paletteModeRadio.checked = true;
        }
        
        // Handle color palette
        if (settings.colorPalette && document.getElementById('assemble-color-palette')) {
            document.getElementById('assemble-color-palette').value = settings.colorPalette;
        }
        
        // Handle color usage mode
        if (settings.colorUsageMode) {
            const colorUsageRadio = document.querySelector(`input[name="color-usage-mode"][value="${settings.colorUsageMode}"]`);
            if (colorUsageRadio) colorUsageRadio.checked = true;
        }
        
        // Handle selected colors
        if (settings.selectedColors && settings.selectedColors.length > 0) {
            settings.selectedColors.forEach(color => {
                const checkbox = document.querySelector(`#individual-color-selection input[value="${color}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Handle single color selection
        if (settings.singleColor && document.getElementById('assemble-color-single')) {
            document.getElementById('assemble-color-single').value = settings.singleColor;
        }
    }
    
    applySceneGuideSettings(settings) {
        if (settings.scene) document.getElementById('assemble-scene').value = settings.scene;
        if (settings.manualScene) document.getElementById('assemble-scene-manual').value = settings.manualScene;
        if (settings.tapeMarkings !== undefined && document.getElementById('assemble-tape-markings')) {
            document.getElementById('assemble-tape-markings').checked = settings.tapeMarkings;
        }
    }
    
    applyWardrobeSettings(settings) {
        if (settings.wardrobe) document.getElementById('assemble-wardrobe').value = settings.wardrobe;
        if (settings.props) document.getElementById('assemble-props').value = settings.props;
    }
    
    applyMoodLightingSettings(settings) {
        if (settings.lighting) document.getElementById('assemble-lighting').value = settings.lighting;
        if (settings.filmType) document.getElementById('assemble-film-type').value = settings.filmType;
        if (settings.filmStock) document.getElementById('assemble-film-stock').value = settings.filmStock;
        if (settings.camera) document.getElementById('assemble-camera').value = settings.camera;
        if (settings.tripodHeight) document.getElementById('assemble-tripod-height').value = settings.tripodHeight;
    }
    
    // Project Management Functions
    createNewProject(projectName) {
        if (!projectName || projectName.trim() === '') {
            this.showNotification('Project name cannot be empty', 'error');
            return false;
        }
        
        const sanitizedName = projectName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
        
        if (this.projects.has(sanitizedName)) {
            this.showNotification('Project already exists', 'error');
            return false;
        }
        
        this.projects.set(sanitizedName, {
            projectName: projectName.trim(),
            version: '1.0',
            lastModified: new Date().toISOString(),
            settings: this.getDefaultSettings()
        });
        
        this.updateProjectDropdown();
        this.currentProject = sanitizedName;
        document.getElementById('project-default').value = sanitizedName;
        
        this.showNotification(`Project "${projectName}" created successfully`, 'success');
        return true;
    }
    
    deleteProject(projectName) {
        if (projectName === 'anamalia-password') {
            this.showNotification('Cannot delete the default project', 'error');
            return false;
        }
        
        if (this.projects.has(projectName)) {
            this.projects.delete(projectName);
            this.updateProjectDropdown();
            
            // Switch to default project if current project was deleted
            if (this.currentProject === projectName) {
                this.currentProject = 'anamalia-password';
                document.getElementById('project-default').value = 'anamalia-password';
                this.loadProject('anamalia-password');
            }
            
            this.showNotification(`Project "${projectName}" deleted successfully`, 'success');
            return true;
        }
        
        this.showNotification('Project not found', 'error');
        return false;
    }
    
    loadProject(projectName) {
        if (!this.projects.has(projectName)) {
            this.showNotification('Project not found', 'error');
            return false;
        }
        
        const project = this.projects.get(projectName);
        const settings = project.settings;
        
        // Apply all settings
        this.applyOutputParametersSettings(settings.outputParameters);
        this.applyStyleGuideSettings(settings.styleGuide);
        this.applyColorProfileSettings(settings.colorProfiles);
        this.applySceneGuideSettings(settings.sceneGuide);
        this.applyWardrobeSettings(settings.wardrobe);
        this.applyMoodLightingSettings(settings.moodLighting);
        
        this.currentProject = projectName;
        this.showNotification(`Project "${project.projectName}" loaded successfully`, 'success');
        return true;
    }
    
    saveProjectToFile(projectName, settings) {
        if (!this.projects.has(projectName)) {
            this.showNotification('Project not found', 'error');
            return false;
        }
        
        const project = this.projects.get(projectName);
        const projectData = {
            ...project,
            settings: settings,
            lastModified: new Date().toISOString()
        };
        
        // Update the project in memory
        this.projects.set(projectName, projectData);
        
        // Create and download JSON file
        const jsonString = JSON.stringify(projectData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`Project "${project.projectName}" saved successfully`, 'success');
        return true;
    }
    
    uploadProjectFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const projectData = JSON.parse(e.target.result);
                    
                    // Validate project structure
                    if (!projectData.projectName || !projectData.settings) {
                        throw new Error('Invalid project file format');
                    }
                    
                    const sanitizedName = projectData.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                    
                    // Add or update project
                    this.projects.set(sanitizedName, {
                        projectName: projectData.projectName,
                        version: projectData.version || '1.0',
                        lastModified: new Date().toISOString(),
                        settings: projectData.settings
                    });
                    
                    this.updateProjectDropdown();
                    this.showNotification(`Project "${projectData.projectName}" imported successfully`, 'success');
                    resolve(sanitizedName);
                } catch (error) {
                    this.showNotification('Invalid project file: ' + error.message, 'error');
                    reject(error);
                }
            };
            reader.onerror = () => {
                this.showNotification('Error reading file', 'error');
                reject(new Error('File read error'));
            };
            reader.readAsText(file);
        });
    }
    
    updateProjectDropdown() {
        const select = document.getElementById('project-default');
        const currentValue = select.value;
        
        // Clear existing options
        select.innerHTML = '';
        
        // Add all projects
        this.projects.forEach((project, key) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = project.projectName;
            if (key === currentValue) option.selected = true;
            select.appendChild(option);
        });
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.project-notification');
        existing.forEach(notification => notification.remove());
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `project-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // Collect all settings
    collectAllSettings() {
        return {
            outputParameters: this.collectOutputParametersSettings(),
            styleGuide: this.collectStyleGuideSettings(),
            colorProfiles: this.collectColorProfileSettings(),
            sceneGuide: this.collectSceneGuideSettings(),
            wardrobe: this.collectWardrobeSettings(),
            moodLighting: this.collectMoodLightingSettings()
        };
    }
    
    // Save specific section
    saveSectionToProject(sectionName) {
        // Map kebab-case section names to camelCase
        const sectionMapping = {
            'output-parameters': 'outputParameters',
            'style-guide': 'styleGuide',
            'color-profiles': 'colorProfiles',
            'scene-guide': 'sceneGuide',
            'wardrobe': 'wardrobe',
            'mood-lighting': 'moodLighting'
        };
        
        const mappedSectionName = sectionMapping[sectionName];
        if (!mappedSectionName) {
            this.showNotification(`Unknown section: ${sectionName}`, 'error');
            return false;
        }
        
        const settings = this.collectAllSettings();
        const sectionSettings = settings[mappedSectionName];
        
        if (!sectionSettings) {
            this.showNotification(`Failed to collect settings for section: ${sectionName}`, 'error');
            return false;
        }
        
        // Update the current project with the new section settings
        const project = this.projects.get(this.currentProject);
        if (project) {
            project.settings[mappedSectionName] = sectionSettings;
            project.lastModified = new Date().toISOString();
            this.projects.set(this.currentProject, project);
        }
        
        this.showNotification(`${sectionName} saved to project`, 'success');
        return true;
    }
    
    // Save all settings
    saveAllSettingsToProject() {
        const settings = this.collectAllSettings();
        return this.saveProjectToFile(this.currentProject, settings);
    }
}

// Initialize the viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.viewer = new AnamaliaViewer();
});
