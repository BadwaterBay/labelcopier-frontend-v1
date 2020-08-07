/**
 * Functionalities for committing changes
 * This script is a work in progress. Function commit() will be moved here.
 */

const formatDate = (dateInput) => {
  const date = dateInput.val();
  const time = dateInput.attr('data-orig-time');

  if (!date) {
    return null;
  }

  const dt = {};
  [dt.year, dt.month, dt.dayOfMonth] = date.split('-').map((e) => +e);
  [dt.hour, dt.minute, dt.second] = time ? time.split(':') : [0, 0, 0];

  const dateObject = new Date(
    dt.year,
    dt.month - 1,
    dt.dayOfMonth,
    dt.hour,
    dt.minute,
    dt.second
  );
  return dateObject.toISOString().replace('.000Z', 'Z');
};

/**
 * Serialize entries for API calls
 * @param {*} jObjectEntry
 * @param {string} kind
 * @return {Object | null} Serialized object
 */
const serializeEntries = (jObjectEntry, kind) => {
  if (kind === 'labels') {
    return {
      name: jObjectEntry.find('[name="name"]').val(),
      color: jObjectEntry.find('[name="color"]').val().slice(1),
      description: jObjectEntry.find('[name="description"]').val(),
      originalName: jObjectEntry.find('[name="name"]').attr('data-orig-val'),
    };
  } else if (kind === 'milestones') {
    if (jObjectEntry.attr('data-number') !== 'null') {
      return {
        title: jObjectEntry.find('[name="title"]').val(),
        state: jObjectEntry.find('[name="state"]').val(),
        description: jObjectEntry.find('[name="description"]').val(),
        due_on: formatDate(jObjectEntry.find('[name="due-date"]')),
        number: +jObjectEntry.attr('data-number'),
      };
    } else {
      if (jObjectEntry.find('[name="due-date"]').val() !== '') {
        return {
          title: jObjectEntry.find('[name="title"]').val(),
          state: jObjectEntry.find('[name="state"]').val(),
          description: jObjectEntry.find('[name="description"]').val(),
          due_on: formatDate(jObjectEntry.find('[name="due-date"]')),
        };
      } else {
        return {
          title: jObjectEntry.find('[name="title"]').val(),
          state: jObjectEntry.find('[name="state"]').val(),
          description: jObjectEntry.find('[name="description"]').val(),
        };
      }
    }
  } else {
    console.log('Bug in function serializeEntries!');
  }
};

export { formatDate, serializeEntries };
