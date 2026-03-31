const { Menu, app } = require('electron');

const {
  MENU_ROLES,
  MENU_LABELS,
  MENU_ACCELERATORS,
  DIALOG_TYPES,
  DIALOG_TITLES,
  DIALOG_MESSAGES,
  OS_PLATFORM,
} = require('../constants');
const { IPC_MENU_NEW_DOCUMENT, IPC_MENU_OPEN_DOCUMENT, IPC_MENU_SAVE_DOCUMENT } = require('../constants/ipcEvents');

/**
 * Menu Builder for Electron application
 */
class MenuBuilder {
  /**
   * @param {import('../types').IWindowManager} windowManager
   */
  constructor(windowManager) {
    this.windowManager = windowManager;
  }

  buildAndSetMenu() {
    const template = this.buildMenuTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  /**
   * @returns {import('../types').MenuTemplate}
   */
  buildMenuTemplate() {
    const template = [
      this.buildFileMenu(),
      this.buildEditMenu(),
      this.buildViewMenu(),
      this.buildWindowMenu(),
      this.buildHelpMenu(),
    ];

    if (process.platform === OS_PLATFORM.DARWIN) {
      return this.addMacOSSpecificMenus(template);
    }

    return template;
  }

  /**
   * @returns {import('electron').MenuItemConstructorOptions}
   */
  buildFileMenu() {
    return {
      label: MENU_LABELS.FILE,
      submenu: [
        {
          label: MENU_LABELS.NEW,
          accelerator: MENU_ACCELERATORS.NEW_DOCUMENT,
          click: () => {
            this.windowManager.sendToRenderer(IPC_MENU_NEW_DOCUMENT);
          },
        },
        {
          label: MENU_LABELS.OPEN,
          accelerator: MENU_ACCELERATORS.OPEN_DOCUMENT,
          click: () => {
            this.windowManager.sendToRenderer(IPC_MENU_OPEN_DOCUMENT);
          },
        },
        {
          label: MENU_LABELS.SAVE,
          accelerator: MENU_ACCELERATORS.SAVE_DOCUMENT,
          click: () => {
            this.windowManager.sendToRenderer(IPC_MENU_SAVE_DOCUMENT);
          },
        },
        { type: 'separator' },
        {
          label: MENU_LABELS.EXIT,
          accelerator:
            process.platform === OS_PLATFORM.DARWIN ? MENU_ACCELERATORS.QUIT_MAC : MENU_ACCELERATORS.QUIT_WINDOWS,
          click: () => {
            app.quit();
          },
        },
      ],
    };
  }

  /**
   * @returns {import('electron').MenuItemConstructorOptions}
   */
  buildEditMenu() {
    return {
      label: MENU_LABELS.EDIT,
      submenu: [
        { role: MENU_ROLES.UNDO },
        { role: MENU_ROLES.REDO },
        { type: 'separator' },
        { role: MENU_ROLES.CUT },
        { role: MENU_ROLES.COPY },
        { role: MENU_ROLES.PASTE },
        { role: MENU_ROLES.SELECT_ALL },
      ],
    };
  }

  /**
   * @returns {import('electron').MenuItemConstructorOptions}
   */
  buildViewMenu() {
    return {
      label: MENU_LABELS.VIEW,
      submenu: [
        { role: MENU_ROLES.RELOAD },
        { role: MENU_ROLES.FORCE_RELOAD },
        { role: MENU_ROLES.TOGGLE_DEV_TOOLS },
        { type: 'separator' },
        { role: MENU_ROLES.RESET_ZOOM },
        { role: MENU_ROLES.ZOOM_IN },
        { role: MENU_ROLES.ZOOM_OUT },
        { type: 'separator' },
        { role: MENU_ROLES.TOGGLE_FULLSCREEN },
      ],
    };
  }

  /**
   * @returns {import('electron').MenuItemConstructorOptions}
   */
  buildWindowMenu() {
    return {
      label: MENU_LABELS.WINDOW,
      submenu: [{ role: MENU_ROLES.MINIMIZE }, { role: MENU_ROLES.CLOSE }],
    };
  }

  /**
   * @returns {import('electron').MenuItemConstructorOptions}
   */
  buildHelpMenu() {
    return {
      role: 'help',
      submenu: [
        {
          label: MENU_LABELS.ABOUT,
          click: async () => {
            await this.windowManager.showMessageBox({
              type: DIALOG_TYPES.INFO,
              title: DIALOG_TITLES.ABOUT_LUMIN_PDF,
              message: DIALOG_MESSAGES.ABOUT_LUMIN_PDF,
              detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode: ${
                process.versions.node
              }`,
            });
          },
        },
      ],
    };
  }

  /**
   * @param {import('../types').MenuTemplate} template
   * @returns {import('../types').MenuTemplate}
   */
  addMacOSSpecificMenus(template) {
    // Add macOS app menu at the beginning
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: MENU_ROLES.ABOUT },
        { type: 'separator' },
        { role: MENU_ROLES.SERVICES, submenu: [] },
        { type: 'separator' },
        { role: MENU_ROLES.HIDE },
        { role: MENU_ROLES.HIDE_OTHERS },
        { role: MENU_ROLES.UNHIDE },
        { type: 'separator' },
        { role: MENU_ROLES.QUIT },
      ],
    });

    // Update Window menu for macOS
    const windowMenuIndex = template.findIndex((menu) => menu.label === MENU_LABELS.WINDOW);
    if (windowMenuIndex !== -1 && template[windowMenuIndex]) {
      const windowMenu = template[windowMenuIndex];
      windowMenu.submenu = [
        { role: MENU_ROLES.CLOSE },
        { role: MENU_ROLES.MINIMIZE },
        { role: MENU_ROLES.ZOOM },
        { type: 'separator' },
        { role: MENU_ROLES.FRONT },
      ];
    }

    return template;
  }
}

module.exports = { MenuBuilder };
