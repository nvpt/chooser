$(function () {
  /*FILTERS*/

  /*filters data*/
  let filtersData = {};
  let cacheFiltersData = {};
  const applyFiltersBtn = $('#applyFilters');
  const clearFiltersBtn = $('#clearFilters');
  clearFiltersBtn.attr('disabled', true);
  applyFiltersBtn.attr('disabled', true);
  /**
   * Apply Filters
   */
  $(document).off('click', '#applyFilters').on('click', '#applyFilters', function () {

    if (applyFiltersBtn.is(':disabled')) {
      return;
    }

    clearFiltersBtn.attr('disabled', false);
    applyFiltersBtn.attr('disabled', true); //BE: if right request
    clearData(); //here is only for FE: imitate the reset of the data after server rendering on page (after server response)
    renderDataFromCache(); //need because of all page will be rerendered and filters data will reset
  });

  /**
   * Clear filters
   */
  $(document).off('click', '#clearFilters').on('click', '#clearFilters', function () {
    if (clearFiltersBtn.is(':disabled')) {
      return;
    }

    applyFiltersBtn.attr('disabled', true);
    clearFiltersBtn.attr('disabled', true);
    clearData();

  });

  function clearData() {
    const chooser = $('.jq-chooser');
    const selectedList = chooser.find('.jq-chooser-selection-list-inner');
    const emptyPlaceHolder = chooser.find('.jq-chooser-empty-placeholder');
    const stored = chooser.find('.jq-stored');
    const dropDownList = chooser.find('.jq-chooser-list');
    selectedList.find('.jq-chooser-selection').remove();
    emptyPlaceHolder.show();
    stored.hide();
    dropDownList.find('.jq-chooser-list-item').prop('checked', false);
    cacheFiltersData = {...filtersData};
    filtersData = {};
  }

  function renderDataFromCache() {
    filtersData = {...cacheFiltersData};
    Object.keys(filtersData).forEach(function (filterName) {
      const chooser = $('.jq-filters-panel').find(`[data-filter='${filterName}']`);
      const selectedList = chooser.find('.jq-chooser-selection-list-inner');
      const emptyPlaceholder = chooser.find('.jq-chooser-empty-placeholder');
      const list = chooser.find('.jq-chooser-list');
      emptyPlaceholder.hide();
      filtersData[filterName].forEach(function (filterVal) {
        let listItem = list.find(`[id='${filterVal}']`);
        listItem.prop('checked', true);
        selectedList.append(_createCheckedOptionTag(filterVal, filterVal));
      });
      _checkLength(chooser);
    });
  }

  /**
   * open/close and click out of chooser;
   */
  $(document).on('click', function (event) {
    const $target = $(event.target);

    //click in
    if ($target.closest('.jq-chooser').length) {
      const toggler = $target.closest('.jq-chooser').find('.jq-chooser-toggle');
      const list = $target.closest('.jq-chooser').find('.jq-chooser-list');

      toggler.addClass('show');
      list.addClass('show');
      //click out
    } else {
      const toggler = $(document).find('.jq-chooser-toggle');
      const list = $(document).find('.jq-chooser').find('.jq-chooser-list');
      toggler.removeClass('show');
      list.removeClass('show');
    }

  });


  /**
   * Select/unselect option from dropdown
   */
  $(document).off('click', '.jq-chooser-list-item').on('click', '.jq-chooser-list-item', function () {
    const listItem = $(this);
    const text = listItem.next().text();
    const optionId = listItem.attr('id');
    const chooser = listItem.closest('.jq-chooser');
    const filterType = chooser.attr('data-filter');
    const selectedList = chooser.find('.jq-chooser-selection-list-inner');
    const emptyPlaceholder = chooser.find('.jq-chooser-empty-placeholder');

    //add
    if (listItem.is(':checked')) {
      emptyPlaceholder.hide();
      selectedList.append(_createCheckedOptionTag(text, optionId));
      addRequestData(filterType, optionId);
      _checkLength(chooser);

      //delete
    } else {
      let unselected = selectedList.find($(`[data-id="${optionId}"]`));
      unselected.remove();
      removeRequestData(filterType, optionId);
      _checkLength(chooser);

      if (!selectedList.children().length) {
        emptyPlaceholder.show();
      }
    }

    applyFiltersBtn.attr('disabled', !_isFiltersChanged());
  });


  /**
   * Delete selected option in filter header
   */
  $(document).off('click', '.jq-chooser-selection-close').on('click', '.jq-chooser-selection-close', function (event) {
    const removedOption = $(this).closest('.jq-chooser-selection');
    const optionId = removedOption.attr('data-id');
    const chooser = removedOption.closest('.jq-chooser');
    const selectedList = chooser.find('.jq-chooser-selection-list-inner');
    const filterType = chooser.attr('data-filter');
    const emptyPlaceholder = chooser.find('.jq-chooser-empty-placeholder');
    removedOption.remove();
    removeRequestData(filterType, optionId);

    const availableOption = chooser.find('.jq-chooser-list').find(`.jq-chooser-list-item[id="${optionId}"]`);
    availableOption.prop('checked', false);

    if (!selectedList.children().length) {
      emptyPlaceholder.show();
    }
    applyFiltersBtn.attr('disabled', !_isFiltersChanged());
    _checkLength(chooser);
  });

  function addRequestData(filterName, objValue) {
    if (!filtersData[filterName]) {
      filtersData[filterName] = [];
    }
    filtersData[filterName].push(objValue);
  }

  function removeRequestData(filterName, objValue) {
    if (filtersData[filterName]) {
      filtersData[filterName] = filtersData[filterName].filter((val) => val !== objValue);
    }
  }

  function _createCheckedOptionTag(text = null, id = null) {
    return $(`<div class="chooser-selection jq-chooser-selection"
                            data-id="${id}">
                             <span class="chooser-selection__text">${text}</span>
                             <img src="close-icon.svg" class="chooser-selection__close jq-chooser-selection-close" alt="">
                        </div>`);
  }


  function _checkLength($chooser = null) {
    const STORED_WIDTH = 45;
    if ($chooser) {
      const selectionContainer = $chooser.find('.jq-chooser-selection-list');
      const stored = $chooser.find('.jq-stored');
      const selection = $chooser.find('.jq-chooser-selection-list-inner');
      const allowedWidth = selectionContainer.width() - STORED_WIDTH;

      let overflowIndex = 0;
      let sumWidth = 0;
      selection.children().each(function (i) {
        const $element = $(this);

        sumWidth += $element.outerWidth();

        if (sumWidth > allowedWidth) {
          console.log(`overflow index `, i);
          console.log(`total children `, selection.children().length);
          overflowIndex = overflowIndex === 0 ? i : overflowIndex;

          $($element).hide();

          const outputCount = selection.children().length - overflowIndex;
          stored.text('+' + outputCount);
          stored.show();
        } else {
          stored.hide();
          selection.children().show();
        }

      });

    }
  }

  function _isAnyDataInFilters() {
    return Object.keys(filtersData).length && Object.keys(filtersData).some((filters) => filtersData[filters].length);
  }

  function _isFiltersChanged() {
    let changed = false;

    let emptyFilters = [];
    let emptyCachedFilters = [];

    Object.keys(filtersData).forEach(function (filter) {
      if (!filtersData[filter].length) {
        emptyFilters.push(filter);
      }
    });

    Object.keys(cacheFiltersData).forEach(function (filter) {
      if (!cacheFiltersData[filter].length) {
        emptyCachedFilters.push(filter);
      }
    });

    emptyFilters.length && emptyFilters.forEach(function (filterName) {
      delete filtersData[filterName];
    });

    emptyCachedFilters.length && emptyCachedFilters.forEach(function (filterName) {
      delete cacheFiltersData[filterName];
    });

    let filtersArr = Object.keys(filtersData);
    let cachedArr = Object.keys(cacheFiltersData);


    if (filtersArr && cachedArr && filtersArr.length === cachedArr.length) {
      filtersArr.forEach(function (filter) {
        if (!cacheFiltersData[filter]) {
          changed = true;
        } else {
          filtersData[filter].forEach(function (filterValue, i) {
            if (!cacheFiltersData[filter][i] || cacheFiltersData[filter][i] !== filterValue) {
              changed = true;
            }
          });
        }
      });

      cachedArr.forEach(function (filter) {
        if (!filtersData[filter]) {
          changed = true;
        } else {
          cacheFiltersData[filter].forEach(function (filterValue, i) {
            if (!filtersData[filter][i] || filtersData[filter][i] !== filterValue) {
              changed = true;
            }
          });
        }

      });

    } else {
      changed = true;
    }

    // console.log('578 >>> filtersData: ', filtersData);
    // console.log('579 >>> filtersArr: ', filtersArr);
    // console.log('579 >>> filtersArr.length: ', filtersArr.length);
    // console.log('580 >>> cacheFiltersData: ', cacheFiltersData);
    // console.log('581 >>> cachedArr: ', cachedArr);
    // console.log('581 >>> cachedArr.length: ', cachedArr.length);

    return changed;
  }

});
