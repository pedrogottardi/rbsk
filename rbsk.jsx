// Turbulent Displace ScriptUI Panel v1.0
// Painel dockável para After Effects - Versão ScriptUI completa
// Desenvolvido por rbsk - 2025
// Compatible with After Effects CC 2018 and later

// Global configuration
var SCRIPT_VERSION = "1.0";
var SCRIPT_NAME = "rbsk";
var DEBUG_MODE = false; // Set to true for debugging

// Performance optimization: Cache frequently used objects
var cachedApp = app;
var cachedProject = null;
var cachedComp = null;

// Utility function for safe logging
function debugLog(message) {
    if (DEBUG_MODE) {
        $.writeln(SCRIPT_NAME + ": " + message);
    }
}

// Verificar se é um painel dockável
if (this instanceof Panel) {
    var panel = this;
    // Configuração para redimensionamento dinâmico
    panel.preferredSize.width = 300;
    panel.minimumSize.width = 280;
    panel.maximumSize.width = 600;
    
    // Permitir redimensionamento dinâmico
    try {
        panel.resizable = true;
    } catch (e) { 
        debugLog("Panel resize setting failed: " + e.toString());
    }
    
    // Configurar tipo de painel para permitir redimensionamento
    try {
        panel.type = "panel";
    } catch (e) { 
        debugLog("Panel type setting failed: " + e.toString());
    }
} else {
    var panel = new Window("dialog", SCRIPT_NAME + " v" + SCRIPT_VERSION);
}

// Função helper para criar alertas customizados com ScriptUI
function showCustomAlert(message, title, isError) {
    title = title || "rbsk";
    
    // Calcular dimensões responsivas mais compactas
    var lines = message.split('\n');
    var maxLineLength = 0;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length > maxLineLength) {
            maxLineLength = lines[i].length;
        }
    }
    
    // Fórmula mais conservadora para evitar alertas muito grandes
    var dynamicWidth = Math.max(280, Math.min(450, maxLineLength * 6.5 + 80));
    var dynamicHeight = Math.max(110, 80 + (lines.length * 18));
    
    var alertDialog = new Window("dialog", title);
    alertDialog.orientation = "column";
    alertDialog.alignChildren = "center";
    alertDialog.spacing = 15;
    alertDialog.margins = 20;
    alertDialog.preferredSize.width = dynamicWidth;
    alertDialog.preferredSize.height = dynamicHeight;
    
    // Mensagem principal com espaçamento otimizado
    var messageText = alertDialog.add("statictext", undefined, message, {multiline: true});
    messageText.alignment = "center";
    messageText.graphics.font = ScriptUI.newFont("Arial", isError ? "BOLD" : "", 12);
    messageText.margins = [10, 10, 10, 15];
    messageText.preferredSize.width = dynamicWidth - 40;
    
    // Botão OK com espaçamento reduzido
    var buttonGroup = alertDialog.add("group");
    buttonGroup.orientation = "row";
    buttonGroup.alignment = "center";
    buttonGroup.spacing = 0;
    buttonGroup.margins = [0, 5, 0, 0];
    
    var okButton = buttonGroup.add("button", undefined, "OK");
    okButton.preferredSize.width = 90;
    okButton.preferredSize.height = 32;
    
    okButton.onClick = function() {
        alertDialog.close();
    };
    
    alertDialog.show();
}

// Função helper para criar diálogos de confirmação customizados
function showCustomConfirm(message, title, options) {
    title = title || "rbsk";
    options = options || ["Substituir", "Manter Ambos", "Cancelar"];
    
    var confirmDialog = new Window("dialog", title);
    confirmDialog.orientation = "column";
    confirmDialog.alignChildren = "center";
    confirmDialog.spacing = 15;
    confirmDialog.margins = 20;
    confirmDialog.preferredSize.width = 380;
    confirmDialog.preferredSize.height = 140;
    
    // Mensagem principal
    var messageText = confirmDialog.add("statictext", undefined, message, {multiline: true});
    messageText.alignment = "center";
    messageText.graphics.font = ScriptUI.newFont("Arial", "BOLD", 12);
    messageText.margins = [10, 10, 10, 15];
    messageText.preferredSize.width = 360;
    
    // Grupo dos botões
    var buttonGroup = confirmDialog.add("group");
    buttonGroup.orientation = "row";
    buttonGroup.alignment = "center";
    buttonGroup.spacing = 15;
    buttonGroup.margins = [5, 5, 5, 5];
    
    var result = null;
    
    for (var i = 0; i < options.length; i++) {
        var button = buttonGroup.add("button", undefined, options[i]);
        button.preferredSize.width = 90;
        button.preferredSize.height = 32;
        
        // Closure para capturar o índice correto
        (function(index) {
            button.onClick = function() {
                result = index;
                confirmDialog.close();
            };
        })(i);
    }
    
    confirmDialog.show();
    return result;
}

// Construir interface do painel
panel.orientation = "column";
panel.alignChildren = "fill";
panel.spacing = 15;
panel.margins = 20;

// Adicionar logo no topo
var logoGroup = panel.add("group");
logoGroup.orientation = "row";
logoGroup.alignment = "fill";
logoGroup.alignChildren = "center";
logoGroup.margins = [0, 0, 0, 10];

try {
    // Carregar logo da pasta media/logo.png relativa ao script
    var scriptFile = File($.fileName);
    var logoPath = scriptFile.parent.fullName + "/media/logo.png";
    var logoFile = File(logoPath);
    
    // Caminhos alternativos para compatibilidade
    var alternatePaths = [
        scriptFile.parent.fullName + "/logo.png", // Fallback para raiz
        Folder.desktop.fullName + "/rbsk-turbulent-displace/media/logo.png"
    ];
    
    var logoLoaded = false;
    
    if (logoFile.exists) {
        var logoImage = logoGroup.add("image", undefined, logoFile);
        logoImage.alignment = "center";
        logoImage.preferredSize.width = 80;
        logoImage.preferredSize.height = 30;
        logoLoaded = true;
        debugLog("Logo loaded from: " + logoPath);
    } else {
        // Try alternative paths
        for (var i = 0; i < alternatePaths.length; i++) {
            var altFile = File(alternatePaths[i]);
            if (altFile.exists) {
                var logoImage = logoGroup.add("image", undefined, altFile);
                logoImage.alignment = "center";
                logoImage.preferredSize.width = 80;
                logoImage.preferredSize.height = 30;
                logoLoaded = true;
                debugLog("Logo loaded from alternative path: " + alternatePaths[i]);
                break;
            }
        }
    }
    
    if (!logoLoaded) {
        // Fallback caso logo não seja encontrado
        var logoText = logoGroup.add("statictext", undefined, SCRIPT_NAME.split(" ")[0]); // "rbsk"
        logoText.graphics.font = ScriptUI.newFont("Arial", "BOLD", 18);
        logoText.alignment = "center";
        debugLog("Logo not found, using text fallback");
    }
    
} catch (e) {
    // Fallback em caso de erro
    var logoText = logoGroup.add("statictext", undefined, SCRIPT_NAME.split(" ")[0]); // "rbsk"
    logoText.graphics.font = ScriptUI.newFont("Arial", "BOLD", 18);
    logoText.alignment = "center";
    debugLog("Logo loading error: " + e.toString());
}

// Função para redimensionamento dinâmico baseado no conteúdo
function updateDynamicSize() {
    if (panel instanceof Panel) {
        try {
            // Permitir que o painel se ajuste dinamicamente ao conteúdo
            panel.resizable = true;
            
            // Forçar layout para calcular tamanho apropriado
            panel.layout.layout(true);
            
            // Calcular altura dinâmica baseada no conteúdo visível
            var baseHeight = 350; // Altura mínima base
            var additionalHeight = 0;
            
            // Adicionar altura extra se posterize está visível
            if (posterizeGroup && posterizeGroup.visible) {
                additionalHeight += 35;
            }
            
            // Definir altura preferida dinâmica (sem forçar máximo/mínimo)
            var calculatedHeight = baseHeight + additionalHeight;
            panel.preferredSize.height = calculatedHeight;
            
            // Permitir redimensionamento pelo usuário
            panel.minimumSize.height = 320; // Altura mínima sensível
            
            // Aplicar o novo layout
            panel.layout.resize();
            
            debugLog("Dynamic size updated - Height: " + calculatedHeight);
            
        } catch (e) {
            debugLog("Dynamic resize error: " + e.toString());
        }
    }
}

// Enhanced validation functions
function validateAfterEffectsEnvironment() {
    try {
        if (!cachedApp || !cachedApp.project) {
            return {valid: false, error: "After Effects não está disponível ou não há projeto aberto."};
        }
        return {valid: true};
    } catch (e) {
        return {valid: false, error: "Erro ao acessar After Effects: " + e.toString()};
    }
}

function updateCachedObjects() {
    try {
        cachedProject = cachedApp.project;
        cachedComp = cachedProject.activeItem;
    } catch (e) {
        debugLog("Failed to update cached objects: " + e.toString());
        cachedProject = null;
        cachedComp = null;
    }
}

// Verificar se múltiplas camadas estão selecionadas
function checkMultipleLayersSelected() {
    try {
        updateCachedObjects();
        if (cachedComp && (cachedComp instanceof CompItem) && cachedComp.selectedLayers.length > 1) {
            return true;
        }
    } catch (e) { 
        debugLog("Error checking multiple layers: " + e.toString());
    }
    return false;
}

// Input validation functions
function validateNumericInput(value, min, max, fieldName) {
    var num = parseFloat(value);
    if (isNaN(num)) {
        return {valid: false, error: fieldName + " deve ser um número válido."};
    }
    if (num < min || num > max) {
        return {valid: false, error: fieldName + " deve estar entre " + min + " e " + max + "."};
    }
    return {valid: true, value: num};
}

// Grupo principal
var mainGroup = panel.add("group");
mainGroup.orientation = "column";
mainGroup.alignChildren = "fill";

// Painel de configurações
var configPanel = mainGroup.add("panel");
configPanel.orientation = "column";
configPanel.alignChildren = "fill";
configPanel.margins = 15;
configPanel.spacing = 8;

// Grupo do título do painel com botão aleatório
var configTitleGroup = configPanel.add("group");
configTitleGroup.orientation = "row";
configTitleGroup.alignChildren = "center";
configTitleGroup.alignment = "left";
configTitleGroup.spacing = 8;
configTitleGroup.margins = [0, 5, 5, 5];

// Label do título
var configTitle = configTitleGroup.add("statictext", undefined, "Configurações do Efeito");
configTitle.graphics.font = ScriptUI.newFont("Arial", "BOLD", 11);
configTitle.alignment = ["left", "center"];

// Botão randomizar (direto ao lado da label)
var btnRandomize = configTitleGroup.add("button", undefined, "🎲");
btnRandomize.preferredSize.width = 30;
btnRandomize.preferredSize.height = 25;
btnRandomize.helpTip = "Randomizar todas as configurações";
btnRandomize.alignment = ["left", "center"];

// Tipo de Displacement
var displacementGroup = configPanel.add("group");
displacementGroup.orientation = "row";
displacementGroup.alignment = "fill";
displacementGroup.alignChildren = "center";

var displacementLabel = displacementGroup.add("statictext", undefined, "Tipo de Displacement:");
displacementLabel.preferredSize.width = 120;
displacementLabel.alignment = "left";

var displacementDropdown = displacementGroup.add("dropdownlist", undefined, [
    "Turbulent",
    "Bulge",
    "Twist",
    "Turbulent Smoother",
    "Bulge Smoother",
    "Twist Smoother",
    "Vertical Displacement",
    "Horizontal Displacement",
    "Cross Displacement"
]);
displacementDropdown.selection = 0; // Turbulent como padrão
displacementDropdown.preferredSize.width = 145;
displacementDropdown.alignment = "fill";

// Quantidade
var amountGroup = configPanel.add("group");
amountGroup.orientation = "row";
amountGroup.alignment = "fill";
amountGroup.alignChildren = "center";

var amountLabel = amountGroup.add("statictext", undefined, "Quantidade:");
amountLabel.preferredSize.width = 120;
amountLabel.alignment = "left";

var amountSlider = amountGroup.add("slider", undefined, 50, 0, 200);
amountSlider.preferredSize.width = 100;
amountSlider.alignment = "fill";

var amountEdit = amountGroup.add("edittext", undefined, "50");
amountEdit.preferredSize.width = 45;
amountEdit.alignment = "right";

// Tamanho
var sizeGroup = configPanel.add("group");
sizeGroup.orientation = "row";
sizeGroup.alignment = "fill";
sizeGroup.alignChildren = "center";

var sizeLabel = sizeGroup.add("statictext", undefined, "Tamanho:");
sizeLabel.preferredSize.width = 120;
sizeLabel.alignment = "left";

var sizeSlider = sizeGroup.add("slider", undefined, 100, 1, 500);
sizeSlider.preferredSize.width = 100;
sizeSlider.alignment = "fill";

var sizeEdit = sizeGroup.add("edittext", undefined, "100");
sizeEdit.preferredSize.width = 45;
sizeEdit.alignment = "right";

// Complexidade
var complexityGroup = configPanel.add("group");
complexityGroup.orientation = "row";
complexityGroup.alignment = "fill";
complexityGroup.alignChildren = "center";

var complexityLabel = complexityGroup.add("statictext", undefined, "Efeito de Rabisco:");
complexityLabel.preferredSize.width = 120;
complexityLabel.alignment = "left";

var complexitySlider = complexityGroup.add("slider", undefined, 2, 1, 10);
complexitySlider.preferredSize.width = 100;
complexitySlider.alignment = "fill";

var complexityEdit = complexityGroup.add("edittext", undefined, "2");
complexityEdit.preferredSize.width = 45;
complexityEdit.alignment = "right";

// Mapeamento correto dos valores de displacement para o After Effects
var displacementValues = [1, 2, 3, 5, 6, 7, 9, 10, 11];

// Painel de presets
var presetsPanel = mainGroup.add("panel", undefined, "Presets");
presetsPanel.orientation = "column";
presetsPanel.alignChildren = "center";
presetsPanel.margins = 15;
presetsPanel.spacing = 8;

// Presets
var presetsGroup = presetsPanel.add("group");
presetsGroup.orientation = "row";
presetsGroup.alignment = "center";
presetsGroup.alignChildren = "center";
presetsGroup.spacing = 15;
presetsGroup.margins = [10, 15, 10, 10];

var btnRabisco = presetsGroup.add("button", undefined, "Rabisco");
btnRabisco.preferredSize.width = 85;
btnRabisco.preferredSize.height = 30;

var btnWiggle = presetsGroup.add("button", undefined, "Wiggle");
btnWiggle.preferredSize.width = 85;
btnWiggle.preferredSize.height = 30;

var btnGlitch = presetsGroup.add("button", undefined, "Glitch");
btnGlitch.preferredSize.width = 85;
btnGlitch.preferredSize.height = 30;

// Painel de opções
var optionsPanel = mainGroup.add("panel", undefined, "Opções");
optionsPanel.orientation = "column";
optionsPanel.alignChildren = "left";
optionsPanel.margins = 15;
optionsPanel.spacing = 8;

var autoKeyframeCheck = optionsPanel.add("checkbox", undefined, "Aplicar Animação");
autoKeyframeCheck.value = true;

var posterizeGroup = optionsPanel.add("group");
posterizeGroup.orientation = "row";
posterizeGroup.alignment = "fill";
posterizeGroup.alignChildren = "center";
posterizeGroup.visible = autoKeyframeCheck.value;

var posterizeLabel = posterizeGroup.add("statictext", undefined, "Posterize Time (fps):");
posterizeLabel.preferredSize.width = 120;
posterizeLabel.alignment = "left";

var posterizeEdit = posterizeGroup.add("edittext", undefined, "8");
posterizeEdit.preferredSize.width = 45;
posterizeEdit.alignment = "right";

var precompCheck = optionsPanel.add("checkbox", undefined, "Aplicar em todas as camadas selecionadas");
precompCheck.value = checkMultipleLayersSelected();

// Botões principais
var buttonGroup = panel.add("group");
buttonGroup.orientation = "row";
buttonGroup.alignment = "center";
buttonGroup.alignChildren = "center";
buttonGroup.spacing = 25;
buttonGroup.margins = [10, 20, 10, 5];

var applyButton = buttonGroup.add("button", undefined, "Aplicar Efeito");
applyButton.preferredSize.width = 125;
applyButton.preferredSize.height = 35;

// Se não for um painel dockável, adicionar botão Cancelar
if (!(panel instanceof Panel)) {
    var cancelButton = buttonGroup.add("button", undefined, "Cancelar");
    cancelButton.preferredSize.width = 125;
    cancelButton.preferredSize.height = 35;
}

// Footer com informações da versão (apenas para painéis dockáveis)
if (panel instanceof Panel) {
    var footerGroup = panel.add("group");
    footerGroup.orientation = "row";
    footerGroup.alignment = "fill";
    footerGroup.alignChildren = "center";
    footerGroup.margins = [10, 5, 10, 10];
    
    var versionText = footerGroup.add("statictext", undefined, "v" + SCRIPT_VERSION);
    versionText.graphics.font = ScriptUI.newFont("Arial", "", 9);
    versionText.graphics.foregroundColor = versionText.graphics.newPen(versionText.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5], 1);
    versionText.alignment = "center";
}

// Event Handlers

// Sincronização de sliders e campos de texto
function syncSliderToEdit(slider, edit) {
    slider.onChanging = function() { 
        edit.text = Math.round(slider.value).toString(); 
    };
    edit.onChanging = function() {
        var val = parseFloat(edit.text);
        if (!isNaN(val)) {
            slider.value = Math.max(slider.minvalue, Math.min(slider.maxvalue, val));
        }
    };
}

syncSliderToEdit(amountSlider, amountEdit);
syncSliderToEdit(sizeSlider, sizeEdit);
syncSliderToEdit(complexitySlider, complexityEdit);

// Controle de visibilidade do Posterize
autoKeyframeCheck.onClick = function() {
    posterizeGroup.visible = autoKeyframeCheck.value;
    updateDynamicSize(); // Recalcular tamanho quando visibilidade muda
};

// Atualizar checkbox de múltiplas camadas
panel.onShow = function() {
    precompCheck.value = checkMultipleLayersSelected();
    if (panel instanceof Panel) {
        updateDynamicSize();
    }
};

// Adicionar evento de redimensionamento para paineis dockáveis
if (panel instanceof Panel) {
    panel.onResize = function() {
        updateDynamicSize();
    };
}

// Botão randomizar
btnRandomize.onClick = function() {
    // Gerar valores aleatórios dentro dos ranges dos sliders
    var randomAmount = Math.floor(Math.random() * 201); // 0-200
    var randomSize = Math.floor(Math.random() * 500) + 1; // 1-500
    var randomComplexity = Math.floor(Math.random() * 10) + 1; // 1-10
    var randomDisplacement = Math.floor(Math.random() * 9); // 0-8 (9 opções)
    var randomPosterize = Math.floor(Math.random() * 17) + 4; // 4-20 fps
    
    // Aplicar valores aleatórios
    amountSlider.value = randomAmount; 
    amountEdit.text = randomAmount.toString();
    sizeSlider.value = randomSize; 
    sizeEdit.text = randomSize.toString();
    complexitySlider.value = randomComplexity; 
    complexityEdit.text = randomComplexity.toString();
    displacementDropdown.selection = randomDisplacement;
    
    // Randomizar se aplica animação (70% de chance de ser true)
    var randomAnimation = Math.random() < 0.7;
    autoKeyframeCheck.value = randomAnimation;
    posterizeGroup.visible = randomAnimation;
    
    if (randomAnimation) {
        posterizeEdit.text = randomPosterize.toString();
    }
    
    panel.layout.layout(true);
    panel.layout.resize();
};

// Presets
btnRabisco.onClick = function() {
    amountSlider.value = 25; amountEdit.text = "25";
    sizeSlider.value = 15; sizeEdit.text = "15";
    complexitySlider.value = 10; complexityEdit.text = "10";
    displacementDropdown.selection = 0; // Turbulent
    autoKeyframeCheck.value = true;
    posterizeGroup.visible = true;
    posterizeEdit.text = "8";
    updateDynamicSize();
    panel.layout.layout(true);
    panel.layout.resize();
};

btnWiggle.onClick = function() {
    amountSlider.value = 15; amountEdit.text = "15";
    sizeSlider.value = 35; sizeEdit.text = "35";
    complexitySlider.value = 1; complexityEdit.text = "1";
    displacementDropdown.selection = 0; // Turbulent
    autoKeyframeCheck.value = true;
    posterizeGroup.visible = true;
    posterizeEdit.text = "8";
    updateDynamicSize();
    panel.layout.layout(true);
    panel.layout.resize();
};

btnGlitch.onClick = function() {
    amountSlider.value = 150; amountEdit.text = "150";
    sizeSlider.value = 3; sizeEdit.text = "3";
    complexitySlider.value = 10; complexityEdit.text = "10";
    displacementDropdown.selection = 7; // Horizontal Displacement
    autoKeyframeCheck.value = true;
    posterizeGroup.visible = true;
    posterizeEdit.text = "12";
    updateDynamicSize();
    panel.layout.layout(true);
    panel.layout.resize();
};

// Enhanced apply effect function with better validation
applyButton.onClick = function() {
    // Validate environment first
    var envCheck = validateAfterEffectsEnvironment();
    if (!envCheck.valid) {
        showCustomAlert(envCheck.error, SCRIPT_NAME, true);
        return;
    }
    
    // Validate numeric inputs
    var amountValidation = validateNumericInput(amountEdit.text, 0, 200, "Quantidade");
    if (!amountValidation.valid) {
        showCustomAlert(amountValidation.error, SCRIPT_NAME, true);
        return;
    }
    
    var sizeValidation = validateNumericInput(sizeEdit.text, 1, 500, "Tamanho");
    if (!sizeValidation.valid) {
        showCustomAlert(sizeValidation.error, SCRIPT_NAME, true);
        return;
    }
    
    var complexityValidation = validateNumericInput(complexityEdit.text, 1, 10, "Efeito de Rabisco");
    if (!complexityValidation.valid) {
        showCustomAlert(complexityValidation.error, SCRIPT_NAME, true);
        return;
    }
    
    cachedApp.beginUndoGroup("Aplicar Turbulent Displace - " + SCRIPT_NAME);
    try {
        updateCachedObjects();
        
        if (!cachedComp || !(cachedComp instanceof CompItem)) {
            showCustomAlert("Por favor, selecione uma composição ativa.", SCRIPT_NAME, true);
            return;
        }

        var selectedLayers = cachedComp.selectedLayers;
        if (selectedLayers.length === 0) {
            showCustomAlert("Por favor, selecione pelo menos uma camada.", SCRIPT_NAME, true);
            return;
        }

        var targetLayers = precompCheck.value ? selectedLayers : [selectedLayers[0]];
        var processedLayers = 0;
        var operationCancelled = false;
        var errorCount = 0;
        var maxErrors = 3; // Limit errors to prevent spam

        var posterizeVal = parseFloat(posterizeEdit.text);
        if (autoKeyframeCheck.value && (isNaN(posterizeVal) || posterizeVal <= 0 || posterizeVal > 60)) {
            showCustomAlert("Por favor, insira um valor válido entre 1 e 60 para Posterize Time (fps).", SCRIPT_NAME, true);
            return;
        }
        
        debugLog("Starting effect application on " + targetLayers.length + " layers");

        for (var i = 0; i < targetLayers.length; i++) {
            try {
                var layer = targetLayers[i];
                
                // Validate layer
                if (!layer || !layer.enabled) {
                    debugLog("Skipping disabled or invalid layer: " + (layer ? layer.name : "unknown"));
                    continue;
                }
                
                var effects = layer.Effects;
                var existingEffect = null;
                if (effects) {
                    for (var j = 1; j <= effects.numProperties; j++) {
                        try {
                            if (effects.property(j).matchName === "ADBE Turbulent Displace") {
                                existingEffect = effects.property(j);
                                break;
                            }
                        } catch (propError) {
                            debugLog("Error checking property " + j + ": " + propError.toString());
                        }
                    }
                }

                if (existingEffect != null) {
                    var message = "A camada '" + layer.name + "' já possui um efeito Turbulent Displace";
                    var dialogResult = showCustomConfirm(message, SCRIPT_NAME, ["Substituir", "Manter Ambos", "Cancelar"]);
                    
                    // Processar baseado na escolha do usuário
                    if (dialogResult === 2) { // Cancelar
                        operationCancelled = true;
                        break; // Sai do loop completamente
                    }
                    
                    var replace = (dialogResult === 0); // Substituir
                    if (replace) {
                        try {
                            existingEffect.remove();
                            debugLog("Removed existing effect from layer: " + layer.name);
                        } catch (removeError) {
                            debugLog("Error removing existing effect: " + removeError.toString());
                        }
                    }
                }

                var effect = layer.Effects.addProperty("Turbulent Displace");
                
                // Apply validated values
                effect.property("Amount").setValue(amountValidation.value);
                effect.property("Size").setValue(sizeValidation.value);
                effect.property("Complexity").setValue(complexityValidation.value);
                
                // Aplicar o tipo de displacement selecionado
                try {
                    var selectedIndex = displacementDropdown.selection.index;
                    var valueToApply = displacementValues[selectedIndex];
                    effect.property("Displacement").setValue(valueToApply);
                    debugLog("Applied displacement type: " + displacementDropdown.selection.text);
                } catch (displacementError) {
                    debugLog("Displacement setting error: " + displacementError.toString());
                    // Continue with default displacement
                }
                
                if (autoKeyframeCheck.value) {
                    try {
                        var expression = "posterizeTime(" + posterizeVal + ");\n(time*1500)%32768";
                        effect.property("Evolution").expression = expression;
                        debugLog("Applied animation expression with " + posterizeVal + " fps");
                    } catch (expressionError) {
                        debugLog("Expression application error: " + expressionError.toString());
                    }
                }
                
                processedLayers++;
                debugLog("Successfully processed layer: " + layer.name);
                
            } catch (layerError) {
                errorCount++;
                debugLog("Error processing layer " + layer.name + ": " + layerError.toString());
                
                if (errorCount <= maxErrors) {
                    showCustomAlert("Erro ao processar camada '" + layer.name + "': " + layerError.toString(), SCRIPT_NAME, true);
                }
                
                if (errorCount >= maxErrors) {
                    var continueProcessing = showCustomConfirm(
                        "Múltiplos erros detectados. Continuar processando as camadas restantes?",
                        SCRIPT_NAME,
                        ["Continuar", "Parar"]
                    );
                    if (continueProcessing === 1) {
                        break;
                    }
                }
            }
        }
        
        // Só mostra alerta de sucesso se alguma camada foi processada e a operação não foi cancelada
        if (processedLayers > 0 && !operationCancelled) {
            var layerWord = processedLayers === 1 ? "camada" : "camadas";
            var alertMessage = "Efeito aplicado com sucesso em " + processedLayers + " " + layerWord + "!";
            showCustomAlert(alertMessage);
            
            // Fechar apenas se for diálogo
            if (!(panel instanceof Panel)) {
                panel.close();
            }
        } else if (operationCancelled) {
            // Não faz nada, apenas retorna à interface
            return;
        }
        
    } catch (error) {
        showCustomAlert("Erro crítico ao aplicar efeito: " + error.toString(), SCRIPT_NAME, true);
        debugLog("Critical error in apply function: " + error.toString());
    } finally {
        cachedApp.endUndoGroup();
    }
};

// Cancelar (apenas para diálogos)
if (!(panel instanceof Panel) && typeof cancelButton !== "undefined") {
    cancelButton.onClick = function() {
        panel.close();
    };
}

// Layout inicial com performance optimization
panel.layout.layout(true);
if (panel instanceof Panel) {
    // Configuração inicial otimizada para painéis dockáveis
    updateDynamicSize();
    
    // Cache the panel reference for better performance
    var panelRef = panel;
    
    // Atualização dinâmica pós-rendering
    cachedApp.setTimeout(function() {
        try {
            updateDynamicSize();
            panelRef.layout.resize();
        } catch (e) {
            debugLog("Delayed resize error: " + e.toString());
        }
    }, 200);
    
    // Final setup dinâmico após construção completa da UI
    cachedApp.setTimeout(function() {
        try {
            updateDynamicSize();
            debugLog("Panel setup complete - Dynamic sizing enabled");
        } catch (e) {
            debugLog("Final setup error: " + e.toString());
        }
    }, 500);
} else {
    // Para diálogos, layout mais simples
    panel.layout.resize();
    debugLog("Dialog layout complete");
}

// Mostrar painel se for diálogo
if (!(panel instanceof Panel)) {
    panel.show();
}

// Performance monitor (only in debug mode)
if (DEBUG_MODE) {
    debugLog("Script loaded successfully. Version: " + SCRIPT_VERSION);
    debugLog("Panel type: " + (panel instanceof Panel ? "Dockable Panel" : "Dialog"));
}