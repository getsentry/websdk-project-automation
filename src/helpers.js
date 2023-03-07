import { addItemToProject, updateIterationField, updateSelectField } from "./github.js";

/**
 *
 * @param {*} items
 * @param {*} projectItems
 */
export const filterItemsNotInProject = (items, projectItems) => {
  const itemsInProject = projectItems.map((item) => item.content?.id);

  return items
    .filter((issue) => !itemsInProject.includes(issue.id))
    .filter((issue) => issue.id);
};

/**
 * Add items to a project
 * 
 * @param {Object} project
 * @param {Array} items
 */
export async function addItemsToProject(project, items) {
  if (items.length) {
    console.info(`[${project.title}] Syncing with project starting...`);

    let newItems = [];
    for (const item of items) {
      const response = await addItemToProject(project.projectId, item.id);
      newItems.push(response.addProjectV2ItemById.item);

      console.info(`[${project.title}] Added: ${item.title} (${item.url})`);
    }

    console.info(`[${project.title}] Syncing with project finished.`);

    return newItems;
  }
  console.info(`[${project.title}] Nothing to sync. Exiting.`);
  return [];
}

/**
 * Update the iteration field of an item belonging to a specific project
 * 
 * @param {Object} project
 * @param {Array} items
 * @param {string} fieldId
 * @param {string} iterationId
 * 
 * @returns {Promise}
 */
export async function updateItemsIterationField(project, items, fieldId, iterationId) {
  if (items.length) {
    console.info(`[${project.title}] Updating iteration field starting...`);

    for (const item of items) {
      await updateIterationField(project, item.id, fieldId, iterationId);

      console.info(`[${project.title}] Updated: ${item.content.title} (${item.content.url})`);
    }
  } else {
    console.info(`[${project.title}] Nothing to update. Exiting.`);
  }
}

/**
 * Update the single select field of an item belonging to a specific project
 * 
 * @param {Object} project
 * @param {Array} items
 * @param {string} fieldId
 * @param {string} selectId
 * 
 * @returns {Promise}
 */
export async function updateItemsSelectField(project, items, fieldId, selectId) {
  if (items.length) {
    console.info(`[${project.title}] Updating select field starting...`);

    for (const item of items) {
      await updateSelectField(project, item.id, fieldId, selectId);

      console.info(`[${project.title}] Updated: ${item.content.title} (${item.content.url})`);
    }
  } else {
    console.info(`[${project.title}] Nothing to update. Exiting.`);
  }
}

/**
 *
 * @param {string} string
 */
export const escapeSpecialChars = (string) => {
  return string
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/"/g, '\\"');
};

/**
 * @param {Object} config
 * @returns {string}
 */
export const queryTeamRepositories = (config) => {
  const repoString = config.repositories
    .map((repo) => `repo:${repo.owner}/${repo.repo}`)
    .join(" ");

  const ignoreString = (config.ignoreLabels ?? [])
    .map((label) => ` -label:"${label}"`)
    .join("");

  return escapeSpecialChars(`${repoString} ${ignoreString} is:open`);
};

/**
 * @param {Object} config
 * @returns {string}
 */
export const querySentryRepositories = (config) => {
  const repoString = config.repositories
    .map((repo) => ` -repo:${repo.owner}/${repo.repo}`)
    .join("");

  return escapeSpecialChars(
    `is:open label:"${config.teamLabel}" org:getsentry ${repoString}`
  );
};
