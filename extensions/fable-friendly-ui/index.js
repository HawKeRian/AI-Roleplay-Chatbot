const MODULE_ID = 'fable-friendly-ui';
const DARK_MODE_KEY = `${MODULE_ID}:dark-mode`;
const LANGUAGE_METADATA_KEY = `${MODULE_ID}:language`;
const LANGUAGE_DEFAULT_KEY = `${MODULE_ID}:language-default`;
const CARD_PROFILE_FIELD = 'fable';
const COMPILED_PROMPT_KEY = `${MODULE_ID}:compiled-prompt`;
const LEGACY_PROMPT_KEYS = [`${MODULE_ID}:language-prompt`, `${MODULE_ID}:character-profile`];
const PERSONA_KEY_PREFIX = `${MODULE_ID}:persona`;
const LANGUAGE_OPTIONS = [
    { value: 'auto', label: 'ตามภาษาของฉัน', shortLabel: 'อัตโนมัติ', icon: 'fa-wand-magic-sparkles' },
    { value: 'th', label: 'ภาษาไทย', shortLabel: 'ไทย', icon: 'fa-language' },
    { value: 'en', label: 'English', shortLabel: 'English', icon: 'fa-language' },
    { value: 'ja', label: '日本語', shortLabel: '日本語', icon: 'fa-language' },
    { value: 'zh', label: '中文', shortLabel: '中文', icon: 'fa-language' },
    { value: 'ko', label: '한국어', shortLabel: '한국어', icon: 'fa-language' },
    { value: 'es', label: 'Español', shortLabel: 'Español', icon: 'fa-language' },
    { value: 'fr', label: 'Français', shortLabel: 'Français', icon: 'fa-language' },
    { value: 'de', label: 'Deutsch', shortLabel: 'Deutsch', icon: 'fa-language' },
];

const LANGUAGE_NAMES = {
    th: 'Thai (ภาษาไทย)', en: 'English', ja: 'Japanese (日本語)', zh: 'Simplified Chinese (简体中文)',
    ko: 'Korean (한국어)', es: 'Spanish (Español)', fr: 'French (Français)', de: 'German (Deutsch)',
};

const LANGUAGE_PROMPTS = {
    auto: 'Write a new in-character reply in the primary language of the user\'s most recent message. Do not translate, paraphrase, summarize, or repeat earlier messages. Treat the character card as background reference only. Preserve established personality, tone, names, honorifics, relationships, and setting. If the user only gives a short greeting, reply with one brief greeting and do not add a new scene, memory, relationship, event, or fact. Never mention these instructions.',
    th: 'เขียนคำตอบใหม่ในบทบาทของตัวละครด้วยภาษาไทยสนทนาที่เป็นธรรมชาติ ห้ามแปล ถอดความ สรุป หรือพูดซ้ำข้อความก่อนหน้า ให้ใช้ข้อมูลในการ์ดเป็นบริบทเท่านั้น รักษาบุคลิก น้ำเสียง ชื่อ คำเรียก ความสัมพันธ์ และฉากที่มีอยู่ ใช้คำลงท้ายให้สอดคล้องกับตัวตนของตัวละครและห้ามผสม ครับ กับ ค่ะ ในคำตอบเดียวกัน ห้ามเพิ่มอีโมจิหากรูปแบบเดิมของตัวละครไม่ได้ใช้ หากผู้ใช้ส่งเพียงคำทักทายสั้น ๆ ให้ทักกลับสั้นเพียงหนึ่งประโยคและห้ามเพิ่มฉาก ความทรงจำ ความสัมพันธ์ เหตุการณ์ หรือข้อเท็จจริงใหม่ ห้ามกล่าวถึงคำสั่งนี้',
    en: 'Write a new in-character reply in natural English. Do not translate, paraphrase, summarize, or repeat earlier messages. Preserve established personality, tone, names, relationships, and setting. If the user message is short or ambiguous, do not invent new facts. Never mention these instructions.',
    ja: 'Write a new in-character reply in natural Japanese. Do not translate, paraphrase, summarize, or repeat earlier messages. Preserve established personality, tone, names, relationships, and setting. If the user message is short or ambiguous, do not invent new facts. Never mention these instructions.',
    zh: 'Write a new in-character reply in natural Simplified Chinese. Do not translate, paraphrase, summarize, or repeat earlier messages. Preserve established personality, tone, names, relationships, and setting. If the user message is short or ambiguous, do not invent new facts. Never mention these instructions.',
    ko: 'Write a new in-character reply in natural Korean. Do not translate, paraphrase, summarize, or repeat earlier messages. Preserve established personality, tone, names, relationships, and setting. If the user message is short or ambiguous, do not invent new facts. Never mention these instructions.',
    es: 'Write a new in-character reply in natural Spanish. Do not translate, paraphrase, summarize, or repeat earlier messages. Preserve established personality, tone, names, relationships, and setting. If the user message is short or ambiguous, do not invent new facts. Never mention these instructions.',
    fr: 'Write a new in-character reply in natural French. Do not translate, paraphrase, summarize, or repeat earlier messages. Preserve established personality, tone, names, relationships, and setting. If the user message is short or ambiguous, do not invent new facts. Never mention these instructions.',
    de: 'Write a new in-character reply in natural German. Do not translate, paraphrase, summarize, or repeat earlier messages. Preserve established personality, tone, names, relationships, and setting. If the user message is short or ambiguous, do not invent new facts. Never mention these instructions.',
};

const EMPTY_CARD_PROFILE = {
    version: 2,
    identity: { tagline: '', gender: '', pronouns: '', age: '', occupation: '', role: '' },
    speech: { selfReference: '', userReference: '', sentenceEnding: '', register: 'auto', notes: '' },
    relationship: { userRole: '', startingRelationship: '' },
    roleplay: { responseLength: 'auto', narrationStyle: 'auto', initiative: 'balanced', emojiUsage: 'character', boundaries: '' },
};

const EMPTY_PERSONA_PROFILE = {
    version: 1,
    preferredName: '',
    pronouns: '',
    selfReference: '',
    preferredAddress: '',
    notes: '',
};

const PROFILE_SELECT_OPTIONS = {
    register: [
        ['auto', 'ตามบุคลิก'], ['casual', 'เป็นกันเอง'], ['polite', 'สุภาพ'], ['formal', 'เป็นทางการ'], ['archaic', 'โบราณ / แฟนตาซี'],
    ],
    responseLength: [
        ['auto', 'อัตโนมัติ'], ['short', 'สั้น'], ['medium', 'ปานกลาง'], ['long', 'ยาวและละเอียด'],
    ],
    narrationStyle: [
        ['auto', 'ตามการ์ด'], ['first', 'บุคคลที่หนึ่ง'], ['third', 'บุคคลที่สาม'], ['dialogue', 'เน้นบทสนทนา'],
    ],
    initiative: [
        ['reactive', 'ตอบสนองผู้ใช้'], ['balanced', 'สมดุล'], ['proactive', 'ขับเคลื่อนเรื่องราว'],
    ],
    emojiUsage: [
        ['character', 'ตามบุคลิก'], ['never', 'ไม่ใช้'], ['allow', 'ใช้ได้เล็กน้อย'],
    ],
};

function makeIconButton(icon, label, onClick, className = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `fable-icon-button ${className}`.trim();
    button.title = label;
    button.setAttribute('aria-label', label);

    const iconElement = document.createElement('i');
    iconElement.className = `fa-solid ${icon}`;
    button.append(iconElement);
    button.addEventListener('click', onClick);
    return button;
}

function plainText(value) {
    return String(value ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/[*_`#>{}\[\]]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function getCharacterDescription(character, useLocalization = true) {
    const profile = character?.data?.extensions?.[CARD_PROFILE_FIELD]
        ?? character?.extensions?.[CARD_PROFILE_FIELD]
        ?? {};
    const tagline = plainText(
        profile?.identity?.tagline
        ?? character?.data?.description
        ?? character?.description
        ?? character?.data?.personality
        ?? '',
    );
    if (useLocalization) {
        const language = getTargetLanguageCode();
        const localization = profile?.localizations?.[language];
        const description = plainText(character?.data?.description ?? character?.description ?? '');
        if (localization?.sourceHash === simpleTextHash(`${tagline}\n${description}`) && localization.tagline) {
            return plainText(localization.tagline);
        }
    }
    return tagline || 'Start a conversation';
}

function getAvatarUrl(context, character) {
    if (!character?.avatar) return '/img/ai4.png';
    try {
        return context.getThumbnailUrl('avatar', character.avatar);
    } catch {
        return `/characters/${encodeURIComponent(character.avatar)}`;
    }
}

function clickControl(selector) {
    const control = document.querySelector(selector);
    if (control instanceof HTMLElement) control.click();
}

function openCharacterManager(createNew = false) {
    const panel = document.querySelector('#right-nav-panel');
    if (!panel?.classList.contains('openDrawer')) clickControl('#rightNavDrawerIcon');
    window.setTimeout(() => {
        clickControl('#rm_button_characters');
        if (createNew) window.setTimeout(() => clickControl('#rm_button_create'), 120);
    }, 120);
}

function openSettings() {
    clickControl('#user-settings-button .drawer-toggle');
}

function openConnection() {
    clickControl('#sys-settings-button .drawer-toggle');
}

function toggleSidebar() {
    document.body.classList.toggle('fable-sidebar-open');
}

function applyStoredTheme() {
    const dark = localStorage.getItem(DARK_MODE_KEY) === 'true';
    document.body.classList.toggle('fable-dark', dark);
}

function toggleTheme() {
    const dark = !document.body.classList.contains('fable-dark');
    document.body.classList.toggle('fable-dark', dark);
    localStorage.setItem(DARK_MODE_KEY, String(dark));
    updateThemeButton();
}

function updateThemeButton() {
    const button = document.querySelector('#fable-theme-toggle');
    if (!(button instanceof HTMLButtonElement)) return;
    const dark = document.body.classList.contains('fable-dark');
    button.innerHTML = `<i class="fa-solid ${dark ? 'fa-sun' : 'fa-moon'}"></i><span>${dark ? 'Light mode' : 'Dark mode'}</span>`;
}

function toggleAdvanced() {
    const visible = document.body.classList.toggle('fable-show-advanced');
    const button = document.querySelector('#fable-advanced-toggle');
    if (button) button.classList.toggle('active', visible);
}

function getCharacterLanguageKey(context) {
    const character = context.characters[Number(context.characterId)];
    const identity = character?.avatar || character?.name || context.groupId || 'global';
    return `${LANGUAGE_DEFAULT_KEY}:${identity}`;
}

function getLanguagePreference() {
    const context = SillyTavern.getContext();
    const chatValue = context.chatMetadata?.[LANGUAGE_METADATA_KEY];
    if (LANGUAGE_PROMPTS[chatValue]) return chatValue;

    const characterValue = localStorage.getItem(getCharacterLanguageKey(context));
    return LANGUAGE_PROMPTS[characterValue] ? characterValue : 'auto';
}

function applyLanguagePreference() {
    applyCompiledPrompt();
}

function saveLanguagePreference(language) {
    if (!LANGUAGE_PROMPTS[language]) return;

    const context = SillyTavern.getContext();
    localStorage.setItem(getCharacterLanguageKey(context), language);

    if (context.chatId && context.chatMetadata) {
        context.chatMetadata[LANGUAGE_METADATA_KEY] = language;
        context.saveMetadataDebounced();
    }

    applyLanguagePreference();
}

function updateLanguageButton(language = getLanguagePreference()) {
    const option = LANGUAGE_OPTIONS.find(item => item.value === language) ?? LANGUAGE_OPTIONS[0];
    const label = document.querySelector('#fable-language-label');
    if (label) label.textContent = option.shortLabel;
}

function updateLanguageMenu(language = getLanguagePreference()) {
    document.querySelectorAll('.fable-language-option').forEach((button) => {
        const selected = button.dataset.language === language;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-checked', String(selected));
    });
}

function closeLanguageMenu() {
    const menu = document.querySelector('#fable-language-menu');
    const button = document.querySelector('#fable-language-button');
    menu?.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
}

function toggleLanguageMenu(event) {
    event.stopPropagation();
    const menu = document.querySelector('#fable-language-menu');
    const button = document.querySelector('#fable-language-button');
    const open = menu?.classList.toggle('open') ?? false;
    button?.setAttribute('aria-expanded', String(open));
}

function buildLanguageControl() {
    const wrap = document.createElement('div');
    wrap.className = 'fable-language-control';

    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'fable-language-button';
    button.className = 'fable-language-button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<i class="fa-solid fa-globe"></i><span id="fable-language-label">อัตโนมัติ</span><i class="fa-solid fa-chevron-down"></i>';
    button.addEventListener('click', toggleLanguageMenu);

    const menu = document.createElement('div');
    menu.id = 'fable-language-menu';
    menu.className = 'fable-language-menu';
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'Conversation language');
    menu.addEventListener('click', event => event.stopPropagation());

    const heading = document.createElement('div');
    heading.className = 'fable-language-heading';
    heading.innerHTML = '<span><strong>ภาษาที่ใช้สนทนา</strong><small>Qwen จะตอบในภาษานี้โดยตรง</small></span><span class="fable-local-badge"><i class="fa-solid fa-lock"></i> Local</span>';

    const options = document.createElement('div');
    options.className = 'fable-language-options';
    options.setAttribute('role', 'radiogroup');

    for (const option of LANGUAGE_OPTIONS) {
        const choice = document.createElement('button');
        choice.type = 'button';
        choice.className = 'fable-language-option';
        choice.dataset.language = option.value;
        choice.setAttribute('role', 'radio');
        choice.innerHTML = `<i class="fa-solid ${option.icon}"></i><span><strong>${option.label}</strong>${option.value === 'auto' ? '<small>เปลี่ยนตามข้อความล่าสุดของคุณ</small>' : ''}</span><i class="fa-solid fa-check"></i>`;
        choice.addEventListener('click', () => {
            saveLanguagePreference(option.value);
            closeLanguageMenu();
        });
        options.append(choice);
    }

    const note = document.createElement('p');
    note.className = 'fable-language-note';
    note.innerHTML = '<i class="fa-solid fa-shield-halved"></i><span>ไม่มีบริการแปลภายนอก ข้อความทั้งหมดอยู่บน Ollama ในเครื่องนี้</span>';

    menu.append(heading, options, note);
    wrap.append(button, menu);
    return wrap;
}

function cloneEmptyProfile() {
    return JSON.parse(JSON.stringify(EMPTY_CARD_PROFILE));
}

function getCardProfile(character) {
    const stored = character?.data?.extensions?.[CARD_PROFILE_FIELD]
        ?? character?.extensions?.[CARD_PROFILE_FIELD]
        ?? {};
    const profile = { ...cloneEmptyProfile(), ...stored };

    for (const section of ['identity', 'speech', 'relationship', 'roleplay']) {
        profile[section] = { ...EMPTY_CARD_PROFILE[section] };
        if (stored?.[section] && typeof stored[section] === 'object') {
            Object.assign(profile[section], stored[section]);
        }
    }

    if (!profile.identity.gender && profile.identity.identity) {
        profile.identity.gender = profile.identity.identity;
    }
    profile.version = 2;

    return profile;
}

function getSelectLabel(group, value) {
    return PROFILE_SELECT_OPTIONS[group]?.find(([key]) => key === value)?.[1] ?? value;
}

function getPersonaStorageKey(context = SillyTavern.getContext()) {
    return `${PERSONA_KEY_PREFIX}:${context.name1 || 'default'}`;
}

function getPersonaProfile(context = SillyTavern.getContext()) {
    try {
        return { ...EMPTY_PERSONA_PROFILE, ...JSON.parse(localStorage.getItem(getPersonaStorageKey(context)) || '{}') };
    } catch {
        return { ...EMPTY_PERSONA_PROFILE };
    }
}

function getCharacterProfileLines(profile) {
    const lines = [];

    if (profile.identity.gender || profile.identity.identity) lines.push(`Character gender or gender identity: ${profile.identity.gender || profile.identity.identity}.`);
    if (profile.identity.pronouns) lines.push(`Character pronouns: ${profile.identity.pronouns}.`);
    if (profile.identity.age) lines.push(`Character age or life stage: ${profile.identity.age}.`);
    if (profile.identity.occupation) lines.push(`Character occupation: ${profile.identity.occupation}.`);
    if (profile.identity.role) lines.push(`Character role in the story: ${profile.identity.role}.`);
    if (profile.speech.selfReference) lines.push(`The character refers to themself as "${profile.speech.selfReference}".`);
    if (profile.speech.userReference) lines.push(`The character addresses the user as "${profile.speech.userReference}".`);
    if (profile.speech.sentenceEnding) lines.push(`Use the character's preferred sentence ending consistently: "${profile.speech.sentenceEnding}".`);
    if (profile.speech.register !== 'auto') lines.push(`Speech register: ${getSelectLabel('register', profile.speech.register)}.`);
    if (profile.speech.notes) lines.push(`Additional speech rules: ${profile.speech.notes}`);
    if (profile.relationship.userRole) lines.push(`The user's role to this character: ${profile.relationship.userRole}.`);
    if (profile.relationship.startingRelationship) lines.push(`Established relationship with the user: ${profile.relationship.startingRelationship}. Do not invent a different relationship.`);
    if (profile.roleplay.responseLength !== 'auto') lines.push(`Preferred reply length: ${getSelectLabel('responseLength', profile.roleplay.responseLength)}.`);
    if (profile.roleplay.narrationStyle !== 'auto') lines.push(`Narration style: ${getSelectLabel('narrationStyle', profile.roleplay.narrationStyle)}.`);
    lines.push(`Story initiative: ${getSelectLabel('initiative', profile.roleplay.initiative)}.`);
    if (profile.roleplay.emojiUsage === 'never') lines.push('Do not use emoji.');
    if (profile.roleplay.emojiUsage === 'allow') lines.push('Emoji may be used sparingly when natural for the character.');
    if (profile.roleplay.boundaries) lines.push(`Content and behavior boundaries: ${profile.roleplay.boundaries}`);

    return lines;
}

function getPersonaProfileLines(persona) {
    const lines = [];
    if (persona.preferredName) lines.push(`The user's preferred name is "${persona.preferredName}".`);
    if (persona.pronouns) lines.push(`The user's pronouns are ${persona.pronouns}.`);
    if (persona.selfReference) lines.push(`The user refers to themself as "${persona.selfReference}".`);
    if (persona.preferredAddress) lines.push(`Unless the character card specifies otherwise, address the user as "${persona.preferredAddress}".`);
    if (persona.notes) lines.push(`Additional user Persona notes: ${persona.notes}`);
    return lines;
}

function getEffectiveLanguagePrompt(context, language) {
    const lastUserMessage = [...(context.chat ?? [])].reverse().find(message => message?.is_user)?.mes ?? '';
    return language === 'auto' && /[\u0E00-\u0E7F]/.test(lastUserMessage)
        ? LANGUAGE_PROMPTS.th
        : LANGUAGE_PROMPTS[language];
}

function compileFablePrompt({ context = SillyTavern.getContext(), profile, persona } = {}) {
    const character = context.characters[Number(context.characterId)];
    const language = getLanguagePreference();
    const resolvedProfile = profile ?? getCardProfile(character);
    const resolvedPersona = persona ?? getPersonaProfile(context);
    const hasStoredProfile = Boolean(
        character?.data?.extensions?.[CARD_PROFILE_FIELD]
        ?? character?.extensions?.[CARD_PROFILE_FIELD],
    );
    const sections = [
        `[Response language]\n${getEffectiveLanguagePrompt(context, language)}`,
    ];
    const personaLines = getPersonaProfileLines(resolvedPersona);
    if (personaLines.length) sections.push(`[User Persona]\n${personaLines.map(line => `- ${line}`).join('\n')}`);
    const characterLines = hasStoredProfile || profile ? getCharacterProfileLines(resolvedProfile) : [];
    if (characterLines.length) sections.push(`[Character preferences]\n${characterLines.map(line => `- ${line}`).join('\n')}`);
    return sections.join('\n\n');
}

function applyCompiledPrompt() {
    const context = SillyTavern.getContext();
    for (const key of LEGACY_PROMPT_KEYS) context.setExtensionPrompt(key, '', -1, 0, false, 0);
    context.setExtensionPrompt(COMPILED_PROMPT_KEY, compileFablePrompt({ context }), 0, 0, false, 0);
    const language = getLanguagePreference();
    updateLanguageButton(language);
    updateLanguageMenu(language);
}

function createProfileField({ section, name, label, hint = '', type = 'text', options = [], scope = 'profile' }) {
    const wrapper = document.createElement('label');
    wrapper.className = `fable-profile-field${type === 'textarea' ? ' fable-profile-field-wide' : ''}`;

    const title = document.createElement('span');
    title.className = 'fable-profile-field-label';
    title.textContent = label;
    wrapper.append(title);

    let control;
    if (type === 'select') {
        control = document.createElement('select');
        for (const [value, optionLabel] of options) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = optionLabel;
            control.append(option);
        }
    } else if (type === 'textarea') {
        control = document.createElement('textarea');
        control.rows = 3;
    } else {
        control = document.createElement('input');
        control.type = 'text';
    }

    if (scope === 'persona') {
        control.dataset.personaName = name;
    } else {
        control.dataset.profileSection = section;
        control.dataset.profileName = name;
    }
    if (hint) control.placeholder = hint;
    wrapper.append(control);

    if (hint && type === 'select') {
        const help = document.createElement('small');
        help.textContent = hint;
        wrapper.append(help);
    }

    return wrapper;
}

function readProfileForm(character) {
    const profile = getCardProfile(character);
    document.querySelectorAll('#fable-profile-form [data-profile-section]').forEach((control) => {
        profile[control.dataset.profileSection][control.dataset.profileName] = control.value.trim();
    });
    return profile;
}

function readPersonaForm(context = SillyTavern.getContext()) {
    const persona = getPersonaProfile(context);
    document.querySelectorAll('#fable-profile-form [data-persona-name]').forEach((control) => {
        persona[control.dataset.personaName] = control.value.trim();
    });
    return persona;
}

function estimateTokens(text) {
    return Math.ceil(String(text ?? '').length / 3.5);
}

function validateCardProfile(character, profile, persona, prompt, maxContext = 8192) {
    const issues = [];
    const gender = `${profile.identity.gender} ${profile.identity.identity ?? ''}`.toLocaleLowerCase();
    const ending = profile.speech.sentenceEnding;
    const selfReference = profile.speech.selfReference;
    const looksFemale = /ผู้หญิง|หญิง|female|woman|girl|she\/?her/.test(gender);
    const looksMale = /ผู้ชาย|ชาย|male|man|boy|he\/?him/.test(gender);

    if (!profile.identity.gender) issues.push({ severity: 'info', message: 'ยังไม่ได้ระบุเพศหรืออัตลักษณ์ทางเพศ' });
    if (!profile.identity.age) issues.push({ severity: 'info', message: 'ยังไม่ได้ระบุอายุหรือช่วงวัย' });
    if (!profile.identity.occupation) issues.push({ severity: 'info', message: 'ยังไม่ได้ระบุอาชีพ' });
    if (/ครับ/.test(ending) && looksFemale) issues.push({ severity: 'warning', message: 'เพศระบุเป็นผู้หญิง แต่คำลงท้ายมี “ครับ”' });
    if (/ค่ะ|คะ/.test(ending) && looksMale) issues.push({ severity: 'warning', message: 'เพศระบุเป็นผู้ชาย แต่คำลงท้ายมี “ค่ะ/คะ”' });
    if (/ครับ/.test(ending) && /ค่ะ|คะ/.test(ending)) issues.push({ severity: 'error', message: 'คำลงท้ายมีทั้ง “ครับ” และ “ค่ะ/คะ” ซึ่งอาจทำให้โมเดลผสมคำลงท้าย' });
    if (looksFemale && selfReference === 'ผม') issues.push({ severity: 'warning', message: 'เพศระบุเป็นผู้หญิง แต่สรรพนามเรียกตัวเองเป็น “ผม”' });
    if (looksMale && selfReference === 'หนู') issues.push({ severity: 'info', message: 'ตรวจว่าสรรพนาม “หนู” ตรงกับบุคลิกที่ต้องการหรือไม่' });
    if (profile.speech.userReference && persona.preferredAddress && profile.speech.userReference !== persona.preferredAddress) {
        issues.push({ severity: 'info', message: `การ์ดจะใช้ “${profile.speech.userReference}” แทนค่า Persona “${persona.preferredAddress}”` });
    }

    const permanentText = [
        character?.data?.description ?? character?.description,
        character?.data?.personality ?? character?.personality,
        character?.data?.scenario ?? character?.scenario,
        prompt,
    ].filter(Boolean).join('\n');
    const permanentTokens = estimateTokens(permanentText);
    const ratio = permanentTokens / Math.max(1, Number(maxContext) || 8192);
    if (ratio > 0.5) issues.push({ severity: 'error', message: `ข้อมูลถาวรใช้ประมาณ ${permanentTokens} tokens หรือมากกว่าครึ่งของ context` });
    else if (ratio > 0.3) issues.push({ severity: 'warning', message: `ข้อมูลถาวรใช้ประมาณ ${permanentTokens} tokens อาจเหลือพื้นที่สนทนาน้อย` });
    if (estimateTokens(prompt) > 450) issues.push({ severity: 'warning', message: 'Fable prompt ยาวเกิน 450 tokens ควรลดกฎที่ซ้ำกัน' });
    return { issues, permanentTokens, promptTokens: estimateTokens(prompt) };
}

function updateQualityPanel() {
    const context = SillyTavern.getContext();
    const character = context.characters[Number(context.characterId)];
    if (!character) return;
    const profile = readProfileForm(character);
    const persona = readPersonaForm(context);
    const prompt = compileFablePrompt({ context, profile, persona });
    const report = validateCardProfile(character, profile, persona, prompt, context.maxContext);
    const preview = document.querySelector('#fable-prompt-preview');
    const tokenLabel = document.querySelector('#fable-prompt-token-count');
    const issues = document.querySelector('#fable-profile-issues');
    if (preview) preview.value = prompt;
    if (tokenLabel) tokenLabel.textContent = `Fable ~${report.promptTokens} tokens · permanent ~${report.permanentTokens} tokens`;
    if (issues) {
        issues.replaceChildren();
        if (!report.issues.length) {
            const ok = document.createElement('div');
            ok.className = 'fable-profile-issue success';
            ok.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>ไม่พบความขัดแย้งที่ชัดเจน</span>';
            issues.append(ok);
        } else {
            for (const issue of report.issues) {
                const item = document.createElement('div');
                item.className = `fable-profile-issue ${issue.severity}`;
                const icon = document.createElement('i');
                icon.className = `fa-solid ${issue.severity === 'error' ? 'fa-circle-xmark' : issue.severity === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'}`;
                const text = document.createElement('span');
                text.textContent = issue.message;
                item.append(icon, text);
                issues.append(item);
            }
        }
    }
}

function createProfileSection(title, description, fields) {
    const section = document.createElement('section');
    section.className = 'fable-profile-section';
    const heading = document.createElement('div');
    heading.className = 'fable-profile-section-heading';
    const headingTitle = document.createElement('strong');
    headingTitle.textContent = title;
    const headingDescription = document.createElement('small');
    headingDescription.textContent = description;
    heading.append(headingTitle, headingDescription);
    const grid = document.createElement('div');
    grid.className = 'fable-profile-grid';
    fields.forEach(field => grid.append(createProfileField(field)));
    section.append(heading, grid);
    return section;
}

function closeCharacterProfile() {
    document.querySelector('#fable-profile-modal')?.classList.remove('open');
}

function getTargetLanguageCode(context = SillyTavern.getContext()) {
    const selected = getLanguagePreference();
    if (selected !== 'auto') return selected;
    const lastUserMessage = [...(context.chat ?? [])].reverse().find(message => message?.is_user)?.mes ?? '';
    if (/[\u0E00-\u0E7F]/.test(lastUserMessage)) return 'th';
    return String(navigator.language || 'en').split('-')[0];
}

function simpleTextHash(value) {
    let hash = 2166136261;
    for (const character of String(value ?? '')) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

async function generateDialogueExample() {
    const context = SillyTavern.getContext();
    const character = context.characters[Number(context.characterId)];
    if (!character) return;
    const button = document.querySelector('#fable-generate-example');
    const output = document.querySelector('#fable-generated-example');
    const profile = readProfileForm(character);
    const persona = readPersonaForm(context);
    const compiledPrompt = compileFablePrompt({ context, profile, persona });
    if (button) {
        button.disabled = true;
        button.textContent = 'กำลังสร้างด้วยโมเดล local…';
    }
    try {
        const prompt = `Create one concise example dialogue that demonstrates the character's voice. Use this exact format and nothing else:\n<START>\n{{user}}: one short line\n{{char}}: one in-character reply\n\nCharacter name: ${character.name}\nCharacter description: ${plainText(character?.data?.description ?? character?.description ?? '')}\n${compiledPrompt}`;
        const result = await context.generateRaw({ prompt, responseLength: 280, trimNames: false });
        if (output) output.value = String(result).trim();
    } catch (error) {
        if (output) output.value = `สร้างตัวอย่างไม่สำเร็จ: ${error?.message ?? error}`;
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = 'สร้างตัวอย่างบทสนทนา';
        }
    }
}

async function saveGeneratedExample() {
    const context = SillyTavern.getContext();
    const characterId = Number(context.characterId);
    const character = context.characters[characterId];
    const output = document.querySelector('#fable-generated-example');
    const example = output?.value?.trim();
    if (!character || !example || example.startsWith('สร้างตัวอย่างไม่สำเร็จ')) return;
    const existing = String(character?.data?.mes_example ?? character?.mes_example ?? '').trim();
    const nextValue = [existing, example].filter(Boolean).join('\n\n');
    const response = await fetch('/api/characters/merge-attributes', {
        method: 'POST',
        headers: context.getRequestHeaders(),
        body: JSON.stringify({ avatar: character.avatar, data: { mes_example: nextValue } }),
    });
    if (!response.ok) throw new Error(`Unable to save example: ${response.statusText}`);
    character.data ??= {};
    character.data.mes_example = nextValue;
    character.mes_example = nextValue;
    if (character.json_data) {
        const jsonData = JSON.parse(character.json_data);
        jsonData.data ??= {};
        jsonData.data.mes_example = nextValue;
        character.json_data = JSON.stringify(jsonData);
    }
    const button = document.querySelector('#fable-save-example');
    if (button) button.textContent = 'บันทึกแล้ว ✓';
}

async function generateLocalTranslation() {
    const context = SillyTavern.getContext();
    const characterId = Number(context.characterId);
    const character = context.characters[characterId];
    if (!character) return;
    const profile = readProfileForm(character);
    const language = getTargetLanguageCode(context);
    const tagline = profile.identity.tagline || getCharacterDescription(character, false);
    const description = plainText(character?.data?.description ?? character?.description ?? '');
    const source = `${tagline}\n${description}`;
    const button = document.querySelector('#fable-translate-card');
    const status = document.querySelector('#fable-translation-status');
    if (button) {
        button.disabled = true;
        button.textContent = 'กำลังแปลด้วย Qwen…';
    }
    try {
        const targetLanguage = LANGUAGE_NAMES[language] ?? language;
        const prompt = `Translate both source fields completely into ${targetLanguage}. The translated text must be written in ${targetLanguage}, while character names remain unchanged. Return exactly two XML elements and no commentary:\n<TAGLINE>translation in ${targetLanguage}</TAGLINE>\n<DESCRIPTION>translation in ${targetLanguage}</DESCRIPTION>\n\nTAGLINE SOURCE:\n${tagline}\n\nDESCRIPTION SOURCE:\n${description}`;
        const result = await context.generateRaw({ prompt, responseLength: 700, trimNames: false });
        const translatedTagline = String(result).match(/<TAGLINE>([\s\S]*?)<\/TAGLINE>/i)?.[1]?.trim();
        const translatedDescription = String(result).match(/<DESCRIPTION>([\s\S]*?)<\/DESCRIPTION>/i)?.[1]?.trim();
        if (!translatedTagline && !translatedDescription) throw new Error('โมเดลส่งรูปแบบคำแปลกลับมาไม่ถูกต้อง');
        if (language === 'th' && !/[\u0E00-\u0E7F]/.test(`${translatedTagline} ${translatedDescription}`)) {
            throw new Error('โมเดลไม่ได้ส่งคำแปลภาษาไทยกลับมา กรุณาลองใหม่');
        }
        profile.localizations ??= {};
        profile.localizations[language] = {
            tagline: translatedTagline || tagline,
            description: translatedDescription || description,
            sourceHash: simpleTextHash(source),
            updatedAt: new Date().toISOString(),
        };
        await context.writeExtensionField(characterId, CARD_PROFILE_FIELD, profile);
        if (status) status.textContent = `บันทึกคำแปล ${language} ไว้ในการ์ดแล้ว`;
        renderAll();
    } catch (error) {
        if (status) status.textContent = `แปลไม่สำเร็จ: ${error?.message ?? error}`;
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = 'แปลข้อมูลแสดงผลด้วย Qwen';
        }
    }
}

function buildQualitySection() {
    const section = document.createElement('section');
    section.className = 'fable-profile-section fable-quality-section';
    const heading = document.createElement('div');
    heading.className = 'fable-profile-section-heading';
    heading.innerHTML = '<strong>ตรวจคุณภาพและเครื่องมือ</strong><small>ตรวจความขัดแย้ง ดู prompt จริง และใช้ Qwen ภายในเครื่องช่วยเตรียมการ์ด</small>';
    const content = document.createElement('div');
    content.className = 'fable-quality-content';
    const issues = document.createElement('div');
    issues.id = 'fable-profile-issues';
    const tokenCount = document.createElement('small');
    tokenCount.id = 'fable-prompt-token-count';
    const preview = document.createElement('textarea');
    preview.id = 'fable-prompt-preview';
    preview.readOnly = true;
    preview.rows = 8;
    preview.setAttribute('aria-label', 'Compiled prompt preview');
    const tools = document.createElement('div');
    tools.className = 'fable-profile-tools';
    const generate = document.createElement('button');
    generate.type = 'button';
    generate.id = 'fable-generate-example';
    generate.textContent = 'สร้างตัวอย่างบทสนทนา';
    generate.addEventListener('click', generateDialogueExample);
    const translate = document.createElement('button');
    translate.type = 'button';
    translate.id = 'fable-translate-card';
    translate.textContent = 'แปลข้อมูลแสดงผลด้วย Qwen';
    translate.addEventListener('click', generateLocalTranslation);
    tools.append(generate, translate);
    const translationStatus = document.createElement('small');
    translationStatus.id = 'fable-translation-status';
    const generated = document.createElement('textarea');
    generated.id = 'fable-generated-example';
    generated.rows = 5;
    generated.placeholder = 'ตัวอย่างบทสนทนาที่สร้างจะปรากฏที่นี่และแก้ไขได้ก่อนบันทึก';
    const saveExample = document.createElement('button');
    saveExample.type = 'button';
    saveExample.id = 'fable-save-example';
    saveExample.className = 'fable-profile-save-example';
    saveExample.textContent = 'เพิ่มลง Example Messages';
    saveExample.addEventListener('click', saveGeneratedExample);
    content.append(issues, tokenCount, preview, tools, translationStatus, generated, saveExample);
    section.append(heading, content);
    return section;
}

function populateCharacterProfile() {
    const context = SillyTavern.getContext();
    const character = context.characters[Number(context.characterId)];
    if (!character) return false;
    const profile = getCardProfile(character);
    const persona = getPersonaProfile(context);

    const name = document.querySelector('#fable-profile-character-name');
    if (name) name.textContent = character.name || 'Character';

    document.querySelectorAll('#fable-profile-form [data-profile-section]').forEach((control) => {
        const value = profile[control.dataset.profileSection]?.[control.dataset.profileName] ?? '';
        control.value = value;
    });
    document.querySelectorAll('#fable-profile-form [data-persona-name]').forEach((control) => {
        control.value = persona[control.dataset.personaName] ?? '';
    });
    const generated = document.querySelector('#fable-generated-example');
    if (generated) generated.value = '';
    const saveExample = document.querySelector('#fable-save-example');
    if (saveExample) saveExample.textContent = 'เพิ่มลง Example Messages';
    const translationStatus = document.querySelector('#fable-translation-status');
    if (translationStatus) translationStatus.textContent = '';
    updateQualityPanel();
    return true;
}

function openCharacterProfile() {
    if (!populateCharacterProfile()) return;
    document.querySelector('#fable-profile-modal')?.classList.add('open');
}

async function saveCharacterProfile(event) {
    event.preventDefault();
    const context = SillyTavern.getContext();
    const characterId = Number(context.characterId);
    if (!context.characters[characterId]) return;

    const profile = readProfileForm(context.characters[characterId]);
    const persona = readPersonaForm(context);
    profile.version = 2;
    persona.version = 1;

    const saveButton = document.querySelector('#fable-profile-save');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = 'กำลังบันทึก…';
    }

    try {
        await context.writeExtensionField(characterId, CARD_PROFILE_FIELD, profile);
        localStorage.setItem(getPersonaStorageKey(context), JSON.stringify(persona));
        applyCompiledPrompt();
        renderAll();
        closeCharacterProfile();
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = 'บันทึกลง Character Card';
        }
    }
}

function buildCharacterProfileModal() {
    const modal = document.createElement('div');
    modal.id = 'fable-profile-modal';
    modal.className = 'fable-profile-modal';
    modal.addEventListener('click', event => {
        if (event.target === modal) closeCharacterProfile();
    });

    const dialog = document.createElement('div');
    dialog.className = 'fable-profile-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'fable-profile-title');

    const header = document.createElement('div');
    header.className = 'fable-profile-header';
    header.innerHTML = '<span><strong id="fable-profile-title">Character Card Profile</strong><small id="fable-profile-character-name"></small></span>';
    header.append(makeIconButton('fa-xmark', 'Close character profile', closeCharacterProfile));

    const form = document.createElement('form');
    form.id = 'fable-profile-form';
    form.addEventListener('submit', saveCharacterProfile);
    form.addEventListener('input', updateQualityPanel);
    form.append(
        createProfileSection('ข้อมูลแนะนำตัว', 'ข้อมูลสั้น ๆ สำหรับแสดงผลและรักษาตัวตน', [
            { section: 'identity', name: 'tagline', label: 'คำโปรย', hint: 'เช่น นักเวทผู้พิทักษ์แห่งป่า' },
            { section: 'identity', name: 'gender', label: 'เพศ / อัตลักษณ์ทางเพศ', hint: 'เช่น ผู้หญิง, ผู้ชาย, non-binary' },
            { section: 'identity', name: 'pronouns', label: 'สรรพนาม', hint: 'เช่น she/her, เขา/เธอ หรือคำเรียกเฉพาะ' },
            { section: 'identity', name: 'age', label: 'อายุ / ช่วงวัย', hint: 'ระบุเท่าที่จำเป็น' },
            { section: 'identity', name: 'occupation', label: 'อาชีพ', hint: 'เช่น นักเรียน, นักเวท, นักสืบ' },
            { section: 'identity', name: 'role', label: 'บทบาทในเรื่อง', hint: 'เช่น ผู้พิทักษ์, คู่แข่ง, ผู้นำทาง' },
        ]),
        createProfileSection('รูปแบบการพูด', 'กำหนดคำเรียกและน้ำเสียงของตัวละคร', [
            { section: 'speech', name: 'selfReference', label: 'เรียกตัวเองว่า', hint: 'ฉัน, ผม, ข้า, ชื่อตัวละคร' },
            { section: 'speech', name: 'userReference', label: 'เรียกผู้ใช้ว่า', hint: 'คุณ, เธอ, Sensei, ชื่อเล่น' },
            { section: 'speech', name: 'sentenceEnding', label: 'คำลงท้าย', hint: 'ค่ะ, ครับ, จ้ะ หรือเว้นว่าง' },
            { section: 'speech', name: 'register', label: 'ระดับภาษา', type: 'select', options: PROFILE_SELECT_OPTIONS.register },
            { section: 'speech', name: 'notes', label: 'ลักษณะการพูดเพิ่มเติม', hint: 'คำติดปาก สำเนียง สิ่งที่ไม่ควรพูด', type: 'textarea' },
        ]),
        createProfileSection('Persona ของผู้ใช้', 'เก็บแยกในเครื่อง ไม่ฝังข้อมูลส่วนตัวลง Character Card', [
            { scope: 'persona', name: 'preferredName', label: 'ชื่อที่ต้องการใช้', hint: 'ชื่อหรือชื่อเล่นของคุณ' },
            { scope: 'persona', name: 'pronouns', label: 'สรรพนามของคุณ', hint: 'เช่น he/him, she/her, they/them' },
            { scope: 'persona', name: 'selfReference', label: 'คุณเรียกตัวเองว่า', hint: 'ฉัน, ผม, หนู, เรา' },
            { scope: 'persona', name: 'preferredAddress', label: 'คำเรียกที่ต้องการ', hint: 'คุณ, Sensei, ชื่อเล่น' },
            { scope: 'persona', name: 'notes', label: 'ข้อมูล Persona เพิ่มเติม', hint: 'ข้อมูลที่ตัวละครควรรู้เกี่ยวกับคุณ', type: 'textarea' },
        ]),
        createProfileSection('ความสัมพันธ์กับผู้ใช้', 'ช่วยป้องกันโมเดลแต่งสถานะความสัมพันธ์ขึ้นใหม่', [
            { section: 'relationship', name: 'userRole', label: 'บทบาทของผู้ใช้', hint: 'เช่น Sensei, เพื่อนร่วมทาง' },
            { section: 'relationship', name: 'startingRelationship', label: 'ความสัมพันธ์เริ่มต้น', hint: 'เช่น นักเรียนกับอาจารย์ ยังไม่สนิทกัน', type: 'textarea' },
        ]),
        createProfileSection('รูปแบบการเล่นบทบาท', 'ควบคุมความยาว การบรรยาย และการขับเคลื่อนเรื่อง', [
            { section: 'roleplay', name: 'responseLength', label: 'ความยาวคำตอบ', type: 'select', options: PROFILE_SELECT_OPTIONS.responseLength },
            { section: 'roleplay', name: 'narrationStyle', label: 'มุมมองการบรรยาย', type: 'select', options: PROFILE_SELECT_OPTIONS.narrationStyle },
            { section: 'roleplay', name: 'initiative', label: 'การขับเคลื่อนเรื่อง', type: 'select', options: PROFILE_SELECT_OPTIONS.initiative },
            { section: 'roleplay', name: 'emojiUsage', label: 'การใช้อีโมจิ', type: 'select', options: PROFILE_SELECT_OPTIONS.emojiUsage },
            { section: 'roleplay', name: 'boundaries', label: 'ข้อจำกัด / สิ่งที่ควรหลีกเลี่ยง', hint: 'พฤติกรรมหรือเนื้อหาที่ตัวละครไม่ควรสร้าง', type: 'textarea' },
        ]),
        buildQualitySection(),
    );

    const footer = document.createElement('div');
    footer.className = 'fable-profile-footer';
    const privacy = document.createElement('span');
    privacy.innerHTML = '<i class="fa-solid fa-box-archive"></i> บันทึกในไฟล์ Character Card ภายในเครื่อง';
    const buttons = document.createElement('div');
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'fable-profile-cancel';
    cancel.textContent = 'ยกเลิก';
    cancel.addEventListener('click', closeCharacterProfile);
    const save = document.createElement('button');
    save.type = 'submit';
    save.id = 'fable-profile-save';
    save.className = 'fable-profile-save';
    save.textContent = 'บันทึกลง Character Card';
    buttons.append(cancel, save);
    footer.append(privacy, buttons);
    form.append(footer);
    dialog.append(header, form);
    modal.append(dialog);
    return modal;
}

function buildShell() {
    if (document.querySelector('#fable-sidebar')) return;

    document.body.classList.add('fable-friendly-ui');
    applyStoredTheme();

    const sidebar = document.createElement('aside');
    sidebar.id = 'fable-sidebar';
    sidebar.setAttribute('aria-label', 'Characters');

    const brand = document.createElement('div');
    brand.className = 'fable-brand';
    brand.innerHTML = '<span class="fable-brand-mark">F</span><span><strong>Fable</strong><small>Local characters</small></span>';
    brand.append(makeIconButton('fa-xmark', 'Close character list', toggleSidebar, 'fable-mobile-close'));

    const newButton = document.createElement('button');
    newButton.type = 'button';
    newButton.className = 'fable-new-character';
    newButton.innerHTML = '<i class="fa-solid fa-plus"></i><span>Create character</span>';
    newButton.addEventListener('click', () => openCharacterManager(true));

    const searchWrap = document.createElement('label');
    searchWrap.className = 'fable-search';
    searchWrap.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    const search = document.createElement('input');
    search.id = 'fable-character-search';
    search.type = 'search';
    search.placeholder = 'Search characters';
    search.autocomplete = 'off';
    search.addEventListener('input', renderCharacters);
    searchWrap.append(search);

    const sectionLabel = document.createElement('div');
    sectionLabel.className = 'fable-section-label';
    sectionLabel.textContent = 'Your characters';

    const list = document.createElement('div');
    list.id = 'fable-character-list';

    const footer = document.createElement('div');
    footer.className = 'fable-sidebar-footer';

    const manage = document.createElement('button');
    manage.type = 'button';
    manage.innerHTML = '<i class="fa-solid fa-address-card"></i><span>Manage characters</span>';
    manage.addEventListener('click', () => openCharacterManager(false));

    const theme = document.createElement('button');
    theme.type = 'button';
    theme.id = 'fable-theme-toggle';
    theme.addEventListener('click', toggleTheme);

    footer.append(manage, theme);
    sidebar.append(brand, newButton, searchWrap, sectionLabel, list, footer);

    const header = document.createElement('header');
    header.id = 'fable-chat-header';
    header.append(makeIconButton('fa-bars', 'Open character list', toggleSidebar, 'fable-mobile-menu'));

    const identity = document.createElement('button');
    identity.type = 'button';
    identity.id = 'fable-current-character';
    identity.addEventListener('click', () => openCharacterManager(false));
    identity.innerHTML = `
        <img id="fable-current-avatar" src="/img/ai4.png" alt="">
        <span class="fable-current-copy">
            <strong id="fable-current-name">Choose a character</strong>
            <small id="fable-current-status"><span></span> Ollama local</small>
        </span>`;

    const actions = document.createElement('div');
    actions.className = 'fable-header-actions';
    actions.append(
        buildLanguageControl(),
        makeIconButton('fa-id-card', 'Character Card profile', openCharacterProfile, 'fable-profile-button'),
        makeIconButton('fa-plug', 'Model connection', openConnection, 'fable-connection-button'),
        makeIconButton('fa-gear', 'Settings', openSettings),
        makeIconButton('fa-sliders', 'Advanced controls', toggleAdvanced, 'fable-advanced-button'),
    );
    actions.lastElementChild.id = 'fable-advanced-toggle';

    header.append(identity, actions);
    document.body.prepend(header);
    document.body.prepend(sidebar);
    document.body.append(buildCharacterProfileModal());
    updateThemeButton();
}

function renderCharacters() {
    const list = document.querySelector('#fable-character-list');
    if (!(list instanceof HTMLElement)) return;

    const context = SillyTavern.getContext();
    const query = document.querySelector('#fable-character-search')?.value?.toLocaleLowerCase() ?? '';
    list.replaceChildren();

    const matches = context.characters
        .map((character, index) => ({ character, index }))
        .filter(({ character }) => `${character?.name ?? ''} ${getCharacterDescription(character)}`.toLocaleLowerCase().includes(query));

    if (!matches.length) {
        const empty = document.createElement('div');
        empty.className = 'fable-empty-list';
        empty.innerHTML = '<i class="fa-regular fa-comments"></i><strong>No characters found</strong><span>Create one to begin a new story.</span>';
        list.append(empty);
        return;
    }

    for (const { character, index } of matches) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'fable-character-card';
        card.classList.toggle('active', Number(context.characterId) === index);

        const avatar = document.createElement('img');
        avatar.src = getAvatarUrl(context, character);
        avatar.alt = '';
        avatar.loading = 'lazy';

        const copy = document.createElement('span');
        copy.className = 'fable-character-copy';
        const name = document.createElement('strong');
        name.textContent = character?.name || 'Untitled character';
        const description = document.createElement('small');
        description.textContent = getCharacterDescription(character);
        copy.append(name, description);

        card.append(avatar, copy);
        card.addEventListener('click', async () => {
            await SillyTavern.getContext().selectCharacterById(index, { switchMenu: false });
            document.body.classList.remove('fable-sidebar-open');
            renderAll();
        });
        list.append(card);
    }
}

function renderHeader() {
    const context = SillyTavern.getContext();
    const character = context.characters[Number(context.characterId)];
    const name = document.querySelector('#fable-current-name');
    const avatar = document.querySelector('#fable-current-avatar');
    const status = document.querySelector('#fable-current-status');

    if (name) name.textContent = character?.name || 'Choose a character';
    if (avatar instanceof HTMLImageElement) avatar.src = getAvatarUrl(context, character);
    if (status) {
        const connected = Boolean(context.onlineStatus && context.onlineStatus !== 'no_connection');
        status.classList.toggle('offline', !connected);
        status.lastChild.textContent = connected ? ` ${context.onlineStatus}` : ' Connect a model';
    }
}

function renderAll() {
    renderCharacters();
    renderHeader();
    applyCompiledPrompt();
}

function registerEvents() {
    const { eventSource, eventTypes } = SillyTavern.getContext();
    const rerenderEvents = [
        eventTypes.CHAT_CHANGED,
        eventTypes.CHARACTER_EDITED,
        eventTypes.CHARACTER_DELETED,
        eventTypes.CHARACTER_DUPLICATED,
        eventTypes.MAIN_API_CHANGED,
        eventTypes.CONNECTION_PROFILE_LOADED,
    ].filter(Boolean);

    for (const event of rerenderEvents) eventSource.on(event, renderAll);
    if (eventTypes.MESSAGE_SENT) eventSource.on(eventTypes.MESSAGE_SENT, applyCompiledPrompt);
}

function init() {
    buildShell();
    registerEvents();
    document.addEventListener('click', closeLanguageMenu);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeLanguageMenu();
            closeCharacterProfile();
        }
    });
    renderAll();
}

const { eventSource, eventTypes } = SillyTavern.getContext();
eventSource.on(eventTypes.APP_READY, init);
