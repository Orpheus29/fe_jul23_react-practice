import React, { useState } from 'react';
import classNames from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map((product) => {
  const category = categoriesFromServer
    .find(({ id }) => id === product.categoryId);
  const user = usersFromServer.find(({ id }) => id === category.ownerId);

  return {
    ...product,
    category,
    user,
  };
});

function getPreparedGoods(
  selectedCategoriesIds,
  filterByUserId,
  sortType,
  isReversed,
  query,
) {
  let visibleProducts = [...products];

  if (selectedCategoriesIds.length !== 0) {
    visibleProducts = visibleProducts
      .filter(({ categoryId }) => selectedCategoriesIds.includes(categoryId));
  }

  if (filterByUserId) {
    visibleProducts = visibleProducts
      .filter(({ user }) => user.id === filterByUserId);
  }

  if (query) {
    const preparedQuery = query.trim().toLowerCase();

    visibleProducts = visibleProducts
      .filter(({ name }) => name.toLowerCase().includes(preparedQuery));
  }

  if (sortType) {
    visibleProducts.sort((a, b) => {
      switch (sortType) {
        case 'ID':
          return a.id - b.id;
        case 'Product':
          return a.name.localeCompare(b.name);
        case 'Category':
          return a.category.title.localeCompare(b.category.title);
        case 'User':
          return a.user.name.localeCompare(b.user.name);
        default:
          return 0;
      }
    });
  }

  if (isReversed) {
    visibleProducts.reverse();
  }

  return visibleProducts;
}

export const App = () => {
  const [selectedCategoriesIds, setSelectedCategoriesIds] = useState([]);
  const [filterByUserId, setFilterByUserId] = useState(0);
  const [query, setQuery] = useState('');
  const [sortType, setSortType] = useState('');
  const [isReversed, setIsReversed] = useState(false);

  const visibleGoods = getPreparedGoods(
    selectedCategoriesIds,
    filterByUserId,
    sortType,
    isReversed,
    query,
  );

  function isCategorySelected(selectedId) {
    return selectedCategoriesIds.includes(selectedId);
  }

  function toggleCategory(selectedId) {
    if (isCategorySelected(selectedId)) {
      setSelectedCategoriesIds(prevState => prevState
        .filter(id => id !== selectedId));
    } else {
      setSelectedCategoriesIds(prevState => [...prevState, selectedId]);
    }
  }

  function handleSortClick(newSortType) {
    const isFirstClick = newSortType !== sortType;
    const isSecondClick = newSortType === sortType && !isReversed;
    const isThirdClick = newSortType === sortType && isReversed;

    if (isFirstClick) {
      setSortType(newSortType);
      setIsReversed(false);
    }

    if (isSecondClick) {
      setIsReversed(true);
    }

    if (isThirdClick) {
      setSortType('');
      setIsReversed(false);
    }
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                className={classNames(
                  { 'is-active': filterByUserId === 0 },
                )}
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => setFilterByUserId(0)}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  className={classNames(
                    { 'is-active': filterByUserId === user.id },
                  )}
                  onClick={() => setFilterByUserId(user.id)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search"
                  value={query}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={classNames(
                  'button', 'is-success', 'mr-6',
                  { 'is-outlined': selectedCategoriesIds.length },
                )}
                onClick={() => setSelectedCategoriesIds([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={classNames(
                    'button', 'mr-2', 'my-1',
                    { 'is-info': isCategorySelected(category.id) },
                  )}
                  onClick={() => toggleCategory(category.id)}
                  href="#/"
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                onClick={() => {
                  setSelectedCategoriesIds([]);
                  setFilterByUserId(0);
                  setSortType('');
                  setIsReversed(false);
                  setQuery('');
                }}
                className={classNames(
                  'button', 'is-link', 'is-fullwidth',
                  { 'is-outlined': visibleGoods.length === products.length },
                )}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {!visibleGoods.length
            ? (
              <p data-cy="NoMatchingMessage">
                No products matching selected criteria
              </p>
            )
            : (
              <table
                data-cy="ProductTable"
                className="table is-striped is-narrow is-fullwidth"
              >

                <thead>
                  <tr>
                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        ID

                        <a href="#/">
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={classNames('fas', {
                                'fa-sort': sortType !== 'ID',
                                'fa-sort-up': sortType === 'ID' && !isReversed,
                                'fa-sort-down': sortType === 'ID' && isReversed,
                              })}
                              onClick={() => {
                                handleSortClick('ID');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSortClick('ID');
                                }
                              }}
                              role="button"
                              tabIndex={0}
                            />
                          </span>
                        </a>
                      </span>
                    </th>

                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        Product

                        <a href="#/">
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={classNames('fas', {
                                'fa-sort': sortType !== 'Product',
                                'fa-sort-up':
                                sortType === 'Product' && !isReversed,
                                'fa-sort-down':
                                sortType === 'Product' && isReversed,
                              })}
                              onClick={() => {
                                handleSortClick('Product');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSortClick('Product');
                                }
                              }}
                              role="button"
                              tabIndex={0}
                            />
                          </span>
                        </a>
                      </span>
                    </th>

                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        Category

                        <a href="#/">
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={classNames('fas', {
                                'fa-sort': sortType !== 'Category',
                                'fa-sort-up':
                                sortType === 'Category' && !isReversed,
                                'fa-sort-down':
                                sortType === 'Category' && isReversed,
                              })}
                              onClick={() => {
                                handleSortClick('Category');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSortClick('Category');
                                }
                              }}
                              role="button"
                              tabIndex={0}
                            />
                          </span>
                        </a>
                      </span>
                    </th>

                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        User

                        <a href="#/">
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={classNames('fas', {
                                'fa-sort': sortType !== 'User',
                                'fa-sort-up':
                                sortType === 'User' && !isReversed,
                                'fa-sort-down':
                                sortType === 'User' && isReversed,
                              })}
                              onClick={() => {
                                handleSortClick('User');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSortClick('User');
                                }
                              }}
                              role="button"
                              tabIndex={0}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleGoods.map(product => (
                    <tr
                      key={product.id}
                      data-cy="Product"
                    >
                      <td className="has-text-weight-bold" data-cy="ProductId">
                        {product.id}
                      </td>

                      <td data-cy="ProductName">
                        {product.name}
                      </td>
                      <td data-cy="ProductCategory">
                        {`${product.category.icon} - ${product.category.title}`}
                      </td>

                      <td
                        data-cy="ProductUser"
                        className={classNames({
                          'has-text-link': product.user.sex === 'm',
                          'has-text-danger': product.user.sex === 'f',
                        })}
                      >
                        {product.user.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>
    </div>
  );
};
