!(function (e) {
  var t = {};
  function n(a) {
    if (t[a]) return t[a].exports;
    var o = (t[a] = { i: a, l: !1, exports: {} });
    return e[a].call(o.exports, o, o.exports, n), (o.l = !0), o.exports;
  }
  (n.m = e),
    (n.c = t),
    (n.d = function (e, t, a) {
      n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: a });
    }),
    (n.r = function (e) {
      'undefined' != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 });
    }),
    (n.t = function (e, t) {
      if ((1 & t && (e = n(e)), 8 & t)) return e;
      if (4 & t && 'object' == typeof e && e && e.__esModule) return e;
      var a = Object.create(null);
      if (
        (n.r(a),
        Object.defineProperty(a, 'default', { enumerable: !0, value: e }),
        2 & t && 'string' != typeof e)
      )
        for (var o in e)
          n.d(
            a,
            o,
            function (t) {
              return e[t];
            }.bind(null, o),
          );
      return a;
    }),
    (n.n = function (e) {
      var t =
        e && e.__esModule
          ? function () {
              return e.default;
            }
          : function () {
              return e;
            };
      return n.d(t, 'a', t), t;
    }),
    (n.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (n.p = ''),
    n((n.s = 0));
})([
  function (e, t, n) {
    'use strict';
    n.r(t);
    var a = () =>
      '\n    <div class="navbar navbar-expand-md navbar-dark bg-dark">\n      <div class="container">\n        <a class="navbar-brand" href="#">\n          GitHub&nbsp;Label&nbsp;Manager\n        </a>\n        <ul class="navbar-nav ml-auto">\n          <li class="nav-item">\n            <a\n              class="nav-link"\n              href="https://github.com/BadwaterBay/github-label-manager-2"\n              target="_blank"\n              rel="noreferrer"\n            >\n              <i class="fab fa-github fa-2x"></i>\n            </a>\n          </li>\n        </ul>\n      </div>\n    </div>\n  ';
    var o = () =>
      '\n    <div class="card bg-light card-body mb-3">\n      <div class="card-header">\n        <h3>\n          Manage your repository\n        </h3>\n      </div>\n      <form>\n        <div class="row">\n          <div class="col-12 col-md-6 col-lg-12">\n            <div class="form-group">\n              <label for="target-owner" class="bmd-label-floating">\n                Repository&nbsp;owner\n              </label>\n              <input\n                type="text"\n                class="form-control"\n                id="target-owner"\n                name="target-owner"\n              />\n              <span class="bmd-help">\n                Such as: BadwaterBay\n              </span>\n            </div>\n            \x3c!-- form-group --\x3e\n          </div>\n          <div class="col-12 col-md-6 col-lg-12">\n            <div class="form-group">\n              <label for="target-repo" class="bmd-label-floating">\n                Repository\n              </label>\n              <input type="text" class="form-control" id="target-repo" />\n              <span class="bmd-help">\n                Such as: template-for-label-and-milestone-1\n              </span>\n            </div>\n            \x3c!-- form-group --\x3e\n          </div>\n          \x3c!-- col --\x3e\n\n          \x3c!-- <div class="row"> --\x3e\n          <div class="col-12">\n            <div class="checkbox">\n              <label>\n                <input\n                  type="checkbox"\n                  id="copy-to-username"\n                  name="checkOwnerOfRepository"\n                  value=""\n                  checked\n                />\n                I\'m the owner of the repository\n              </label>\n            </div>\n          </div>\n          \x3c!-- col --\x3e\n          \x3c!-- </div> --\x3e\n        </div>\n        \x3c!-- row --\x3e\n        <div class="row">\n          <div class="col-12 col-md-6 col-lg-12">\n            <div class="form-group">\n              <label class="bmd-label-floating" for="target-username">\n                Username&nbsp;for&nbsp;authentication\n              </label>\n              <input\n                type="text"\n                class="form-control"\n                id="target-username"\n                name="target-username"\n              />\n              <span class="bmd-help">\n                You can manage repositories you own or have access to\n              </span>\n            </div>\n          </div>\n          \x3c!-- col --\x3e\n          <div class="col-12 col-md-6 col-lg-12">\n            <div class="form-group">\n              <label\n                for="personal-access-token"\n                class="bmd-label-floating"\n              >\n                Personal&nbsp;access&nbsp;token\n              </label>\n              <input\n                type="password"\n                class="form-control"\n                id="personal-access-token"\n              />\n              <span class="bmd-help">\n                We don\'t store your GitHub personal access token\n              </span>\n            </div>\n          </div>\n          \x3c!-- col --\x3e\n        </div>\n        \x3c!-- row --\x3e\n      </form>\n      <div class="row">\n        <div class="col-12 col-md-4 col-lg-12">\n          <button\n            id="list-all-labels"\n            type="button"\n            class="btn btn-block btn-outline-secondary"\n            data-loading-text="Loading..."\n          >\n            List labels\n          </button>\n        </div>\n        \x3c!-- col --\x3e\n        <div class="col-12 col-md-4 col-lg-12">\n          <button\n            id="list-all-milestones"\n            type="button"\n            class="btn btn-block btn-outline-secondary"\n            data-loading-text="Loading..."\n          >\n            List milestones\n          </button>\n        </div>\n        \x3c!-- col --\x3e\n        \x3c!-- </div> --\x3e\n        \x3c!-- row --\x3e\n        \x3c!-- <div class="row"> --\x3e\n        <div class="col-12 col-md-4 col-lg-12">\n          <button\n            id="commit-to-target-repo"\n            type="button"\n            class="btn btn-raised btn-outline-success btn-block"\n            disabled\n            data-loading-text="Commiting..."\n          >\n            Commit&nbsp;changes\n          </button>\n        </div>\n        \x3c!-- col --\x3e\n      </div>\n      \x3c!-- row --\x3e\n    </div>\n  ';
    var l = () =>
      '\n    <div class="card bg-light card-body mb-3">\n      <div class="card-header">\n        <h3>\n          Copy from an existing repository\n        </h3>\n      </div>\n      <div class="form-text text-muted">\n        You can copy labels and milestones from other repositories and\n        modify them before committing to your repository.\n      </div>\n      <div>\n        <form>\n          <div class="row">\n            <div class="col-12 col-md-6 col-lg-12">\n              <div class="form-group">\n                <label for="target-owner" class="bmd-label-floating">\n                  Repository&nbsp;owner\n                </label>\n                <input\n                  type="text"\n                  class="form-control"\n                  id="copy-from-owner"\n                />\n                <span class="bmd-help">\n                  Such as: BadwaterBay\n                </span>\n              </div>\n            </div>\n            \x3c!-- col --\x3e\n            <div class="col-12 col-md-6 col-lg-12">\n              <div class="form-group">\n                <label for="target-repo" class="bmd-label-floating">\n                  Repository\n                </label>\n                <input\n                  type="text"\n                  class="form-control"\n                  id="copy-from-repo"\n                />\n                <span class="bmd-help">\n                  Such as: template-for-label-and-milestone-1\n                </span>\n              </div>\n            </div>\n            \x3c!-- col --\x3e\n          </div>\n          \x3c!-- row --\x3e\n        </form>\n        <div class="row">\n          <div class="col-12 col-md-6 col-lg-12">\n            <button\n              id="copy-labels-from"\n              type="button"\n              class="btn btn-outline-info btn-block"\n              data-loading-text="Adding..."\n            >\n              Copy&nbsp;labels\n            </button>\n          </div>\n          \x3c!-- col --\x3e\n          <div class="col-12 col-md-6 col-lg-12">\n            <button\n              id="copy-milestones-from"\n              type="button"\n              class="btn btn-outline-info btn-block"\n              data-loading-text="Adding..."\n            >\n              Copy&nbsp;milestones\n            </button>\n          </div>\n          \x3c!-- col --\x3e\n        </div>\n        \x3c!-- row --\x3e\n        \x3c!-- <button id="delete-and-copy-labels-from" type="button" class="btn btn-outline-info btn-block"\n        data-loading-text="Cloning...">\n        Delete all existing labels and copy\n      </button>\n      <button id="delete-and-copy-milestones-from" type="button" class="btn btn-outline-info btn-block"\n        data-loading-text="Cloning...">\n        Delete all existing milestones and copy\n      </button> --\x3e\n      </div>\n    </div>\n  ';
    var s = () =>
      '\n    <div class="card bg-light card-body mb-3">\n      <ul class="nav nav-tabs nav-justified" id="nav-tab" role="tablist">\n        <li class="nav-item">\n          <a\n            class="nav-link active"\n            id="labels-tab"\n            data-toggle="tab"\n            href="#labels-form"\n            role="tab"\n            aria-controls="labels-form"\n            aria-selected="true"\n          >\n            Labels\n          </a>\n        </li>\n        <li class="nav-item">\n          <a\n            class="nav-link"\n            id="milestones-tab"\n            data-toggle="tab"\n            href="#milestones-form"\n            role="tab"\n            aria-controls="milestones-form"\n            aria-selected="false"\n          >\n            Milestones\n          </a>\n        </li>\n        <li class="nav-item">\n          <a\n            class="nav-link"\n            id="faq-tab"\n            data-toggle="tab"\n            href="#faq-form"\n            role="tab"\n            aria-controls="faq-form"\n            aria-selected="false"\n          >\n            FAQ\n          </a>\n        </li>\n      </ul>\n      <div class="card-body">\n        <div class="tab-content" id="nav-tab-content">\n          <div\n            class="tab-pane active"\n            id="labels-form"\n            role="tabpanel"\n            aria-labelledby="labels-tab"\n          >\n            <div class="row">\n              <div class="col-12 col-md-4">\n                <button\n                  id="delete-all-labels"\n                  type="button"\n                  class="btn btn-outline-danger btn-block"\n                  data-loading-text="Deleting..."\n                >\n                  Delete all\n                </button>\n              </div>\n              <div class="col-12 col-md-4">\n                <button\n                  id="revert-labels-to-original"\n                  type="button"\n                  class="btn btn-outline-warning btn-block"\n                  disabled\n                  data-loading-text="Resetting..."\n                >\n                  Undo all\n                </button>\n              </div>\n              <div class="col-12 col-md-4">\n                <button\n                  id="add-new-label-entry"\n                  type="button"\n                  class="btn btn-outline-success btn-block mb-3"\n                >\n                  New label\n                </button>\n              </div>\n            </div>\n            \x3c!-- row --\x3e\n            <form id="form-labels" class="form-inline"></form>\n          </div>\n          <div\n            class="tab-pane"\n            id="milestones-form"\n            role="tabpanel"\n            aria-labelledby="milestones-tab"\n          >\n            <div class="row">\n              <div class="col-12 col-md-4">\n                <button\n                  id="delete-all-milestones"\n                  type="button"\n                  class="btn btn-outline-danger btn-block"\n                  data-loading-text="Deleting..."\n                >\n                  Delete all\n                </button>\n              </div>\n              <div class="col-12 col-md-4">\n                <button\n                  id="revert-milestones-to-original"\n                  type="button"\n                  class="btn btn-outline-warning btn-block"\n                  disabled\n                  data-loading-text="Resetting..."\n                >\n                  Undo all\n                </button>\n              </div>\n              <div class="col-12 col-md-4">\n                <button\n                  id="add-new-milestone-entry"\n                  type="button"\n                  class="btn btn-outline-success btn-block mb-3"\n                >\n                  New milestone\n                </button>\n              </div>\n            </div>\n            \x3c!-- row --\x3e\n            <form id="form-milestones" class="form-inline"></form>\n          </div>\n          <div\n            class="tab-pane"\n            id="faq-form"\n            role="tabpanel"\n            aria-labelledby="faq-tab"\n          >\n            <div class="card-header">\n              <h3>\n                How this web app works?\n              </h3>\n            </div>\n            <div id="collapse-card-token-safety">\n              <div class="card-body">\n                <p>\n                  This web app works by making cross-site requests to\n                  GitHub\'s API. You can also download this website and use\n                  it on your localhost.\n                </p>\n              </div>\n            </div>\n            <div class="card-header">\n              <h3>\n                Is my personal access token safe?\n              </h3>\n            </div>\n            <div>\n              <div class="card-body">\n                <p>\n                  This web app authenticates to GitHub API via\n                  <strong>HTTP Basic Authentication</strong>, but all API\n                  calls are done over <strong>SSL</strong>, so your\n                  personal access token is safe.\n                </p>\n                <p>\n                  Although you can use your password in lieu of a personal\n                  access token, it is highly encouraged to use a personal\n                  access token.\n                </p>\n                <p>\n                  <a\n                    href="https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line"\n                    target="_blank"\n                  >\n                    How to create a personal access token?\n                  </a>\n                </p>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  ';
    var i = () =>
      '\n    <div id="loadingModal" class="modal fade" tabindex="-1" role="dialog">\n      <div class="modal-dialog" role="document">\n        <div class="modal-content">\n          <div class="modal-header">\n            <h5 class="modal-title">\n              Please&nbsp;wait...\n            </h5>\n            <button\n              type="button"\n              class="close"\n              data-dismiss="modal"\n              aria-label="Close"\n            >\n              <span aria-hidden="true">&times;</span>\n            </button>\n          </div>\n          <div class="modal-body">\n            <p>\n              Commiting...\n            </p>\n          </div>\n        </div>\n      </div>\n    </div>\n    \x3c!-- #loadingModal --\x3e\n  ';
    var r = () =>
      $(document).ready(function () {
        $('body').bootstrapMaterialDesign(),
          $('#copy-to-username').click(function () {
            $('#target-username').val(() =>
              $(this).prop('checked') ? $('#target-owner').val() : '',
            );
          }),
          $('#target-owner').keyup(() => {
            $('#copy-to-username').prop('checked') &&
              $('#target-username').val($('#target-owner').val());
          }),
          $('#target-username').keyup(function () {
            $('#copy-to-username').prop(
              'checked',
              () => $(this).val() === $('#target-owner').val(),
            );
          });
        const e = () => ({
            targetOwner: $('#target-owner').val().trim(),
            targetRepo: $('#target-repo').val().trim(),
            targetUsername: $('#target-username').val().trim(),
            personalAccessToken: $('#personal-access-token').val().trim(),
            copyFromOwner: $('#copy-from-owner').val().trim(),
            copyFromRepo: $('#copy-from-repo').val().trim(),
          }),
          t = (e) => {
            $('#loadingModal .modal-body').append(e + '<br />');
          },
          n = (e) => {
            let t = !0;
            return (
              e.find(':input[data-orig-val]').each(function () {
                $(this).val() !== $(this).attr('data-orig-val') && (t = !1);
              }),
              t
            );
          },
          a = () => {
            const e = () => {
                $('#commit-to-target-repo').attr('disabled', !0),
                  $('#commit-to-target-repo').removeClass('btn-success'),
                  $('#commit-to-target-repo').addClass('btn-outline-success');
              },
              t = $('.label-entry:not([data-todo="none"])').length > 0,
              n = $('.milestone-entry:not([data-todo="none"])').length > 0,
              a = $('.label-entry.duplicate-entry').length > 0,
              o = $('.milestone-entry.duplicate-entry').length > 0;
            t
              ? $('#revert-labels-to-original').removeAttr('disabled')
              : $('#revert-labels-to-original').attr('disabled', !0),
              n
                ? $('#revert-milestones-to-original').removeAttr('disabled')
                : $('#revert-milestones-to-original').attr('disabled', !0),
              a || o
                ? e()
                : t || n
                ? ($('#commit-to-target-repo').removeAttr('disabled'),
                  $('#commit-to-target-repo').removeClass(
                    'btn-outline-success',
                  ),
                  $('#commit-to-target-repo').addClass('btn-success'))
                : e();
          },
          o = {
            _keyStr:
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
            encode: function (e) {
              let t,
                n,
                a,
                l,
                s,
                i,
                r,
                d = '',
                c = 0;
              for (e = o._utf8_encode(e); c < e.length; )
                (t = e.charCodeAt(c++)),
                  (n = e.charCodeAt(c++)),
                  (a = e.charCodeAt(c++)),
                  (l = t >> 2),
                  (s = ((3 & t) << 4) | (n >> 4)),
                  (i = ((15 & n) << 2) | (a >> 6)),
                  (r = 63 & a),
                  isNaN(n) ? (i = r = 64) : isNaN(a) && (r = 64),
                  (d =
                    d +
                    this._keyStr.charAt(l) +
                    this._keyStr.charAt(s) +
                    this._keyStr.charAt(i) +
                    this._keyStr.charAt(r));
              return d;
            },
            decode: function (e) {
              let t,
                n,
                a,
                l,
                s,
                i,
                r,
                d = '',
                c = 0;
              for (e = e.replace(/[^A-Za-z0-9+/=]/g, ''); c < e.length; )
                (l = this._keyStr.indexOf(e.charAt(c++))),
                  (s = this._keyStr.indexOf(e.charAt(c++))),
                  (i = this._keyStr.indexOf(e.charAt(c++))),
                  (r = this._keyStr.indexOf(e.charAt(c++))),
                  (t = (l << 2) | (s >> 4)),
                  (n = ((15 & s) << 4) | (i >> 2)),
                  (a = ((3 & i) << 6) | r),
                  (d += String.fromCharCode(t)),
                  64 != i && (d += String.fromCharCode(n)),
                  64 != r && (d += String.fromCharCode(a));
              return (d = o._utf8_decode(d)), d;
            },
            _utf8_encode: (e) => {
              e = e.replace(/\r\n/g, '\n');
              let t = '';
              for (let n = 0; n < e.length; n++) {
                const a = e.charCodeAt(n);
                a < 128
                  ? (t += String.fromCharCode(a))
                  : a > 127 && a < 2048
                  ? ((t += String.fromCharCode((a >> 6) | 192)),
                    (t += String.fromCharCode((63 & a) | 128)))
                  : ((t += String.fromCharCode((a >> 12) | 224)),
                    (t += String.fromCharCode(((a >> 6) & 63) | 128)),
                    (t += String.fromCharCode((63 & a) | 128)));
              }
              return t;
            },
            _utf8_decode: (e) => {
              let t = '',
                n = 0,
                [a, o, l] = [0, 0, 0];
              for (; n < e.length; )
                (a = e.charCodeAt(n)),
                  a < 128
                    ? ((t += String.fromCharCode(a)), n++)
                    : a > 191 && a < 224
                    ? ((o = e.charCodeAt(n + 1)),
                      (t += String.fromCharCode(((31 & a) << 6) | (63 & o))),
                      (n += 2))
                    : ((o = e.charCodeAt(n + 1)),
                      (l = e.charCodeAt(n + 2)),
                      (t += String.fromCharCode(
                        ((15 & a) << 12) | ((63 & o) << 6) | (63 & l),
                      )),
                      (n += 3));
              return t;
            },
          };
        let l = !1;
        const s = (() => {
          let e = 0;
          return {
            acquire: () => (++e, null),
            release: () => {
              if (e <= 0) throw new Error('Semaphore inconsistency');
              return --e, null;
            },
            isLocked: () => e > 0,
          };
        })();
        $.ajaxSetup({
          cache: !1,
          complete: () => {
            s.release(),
              l &&
                !1 === s.isLocked() &&
                (t('All operations are done.'),
                $('#loadingModal .modal-content').append(
                  '\n          <div class="modal-footer">\n            <button type="button" class="btn btn-secondary"\n              data-dismiss="modal" aria-label="Close">\n              <span aria-hidden="true">\n                Close\n              </span>\n            </button>\n          </div>\n        ',
                ));
          },
          beforeSend: (t) => {
            const n = e();
            s.acquire(),
              n.targetUsername &&
                n.personalAccessToken &&
                t.setRequestHeader(
                  'Authorization',
                  ((e) =>
                    'Basic ' +
                    o.encode(`${e.targetUsername}:${e.personalAccessToken}`))(
                    n,
                  ),
                );
          },
        });
        const i = new Set(),
          r = new Set(),
          d = (e, t, n, o, l) => {
            const s = (e, t, n, a) => {
                let o = `https://api.github.com/repos/${e}/${t}/${n}?page=${a}`;
                return 'milestones' === n && (o += '&state=all'), o;
              },
              d = (e, t, n, o, l, c) => {
                $.ajax({
                  type: 'GET',
                  url: s(e, t, n, c),
                  success: (a) => {
                    if (a) {
                      if (0 === a.length)
                        return void (
                          1 === c && alert(`No ${n} exist in this repo!`)
                        );
                      'labels' === n
                        ? a.forEach((e) => {
                            (e.color = '#' + e.color.toUpperCase()),
                              p(e, o),
                              i.add(e.name);
                          })
                        : 'milestones' === n
                        ? a.forEach((e) => {
                            v(e, o), r.add(e.title);
                          })
                        : console.log(
                            'Bug in function apiCallGetEntriesRecursive!',
                          );
                    }
                    'function' == typeof l && l(a), d(e, t, n, o, l, ++c);
                  },
                  error: (e) => {
                    404 === e.status &&
                      alert(
                        'Not found! If this is a private repo, make sure you \n                provide a personal access token.',
                      ),
                      'function' == typeof l && l(e);
                  },
                }),
                  a();
              };
            'labels' === n
              ? i.clear()
              : 'milestones' === n
              ? r.clear()
              : console.log('Bug in function apiCallGetEntries!'),
              d(e, t, n, o, l, 1);
          },
          c = (e, t) => {
            let n = '';
            return (
              (n =
                'labels' === t
                  ? e.name
                  : 'milestones' === t
                  ? e.title
                  : "There's a bug in function assignAPICallSign!"),
              n
            );
          },
          u = (n, a, o) => {
            const l = e(),
              s = c(n, a);
            $.ajax({
              type: 'POST',
              url: `https://api.github.com/repos/${l.targetOwner}/${l.targetRepo}/${a}`,
              data: JSON.stringify(n),
              success: (e) => {
                'function' == typeof o && o(e),
                  t(`Created ${a.slice(0, -1)}: ${s}`);
              },
              error: (e, n, o) => {
                t(
                  'Creation of ' +
                    a.slice(0, -1) +
                    `failed for: ${s} due to error: ${o}`,
                );
              },
            });
          },
          b = (n, a, o) => {
            const l = ((e, t) => {
                let n = '';
                return (
                  'labels' === t
                    ? ((n = e.originalName), delete e.originalName)
                    : (n =
                        'milestones' === t
                          ? e.number
                          : "There's a bug in function assignAPICallSign4Update!"),
                  n
                );
              })(n, a),
              s = e(),
              i = c(n, a);
            $.ajax({
              type: 'PATCH',
              url: `https://api.github.com/repos/${s.targetOwner}/${s.targetRepo}/${a}/${l}`,
              data: JSON.stringify(n),
              success: (e) => {
                'function' == typeof o && o(e),
                  t('Updated ' + a.slice(0, -1) + `: ${l} => ${i}`);
              },
              error: (e, n, o) => {
                t(
                  'Update of ' +
                    a.slice(0, -1) +
                    ` failed for: ${l} due to error: ${o}`,
                );
              },
            });
          },
          m = (n, a, o) => {
            const l = ((e, t) => {
                let n = '';
                return (
                  (n =
                    'labels' === t
                      ? e.originalName
                      : 'milestones' === t
                      ? e.number
                      : "There's a bug in function assignAPICallSign4Delete!"),
                  n
                );
              })(n, a),
              s = e(),
              i = c(n, a);
            $.ajax({
              type: 'DELETE',
              url: `https://api.github.com/repos/${s.targetOwner}/${s.targetRepo}/${a}/${l}`,
              success: (e) => {
                'function' == typeof o && o(e),
                  t(`Deleted ${a.slice(0, -1)}: ${i}`);
              },
              error: (e, n, o) => {
                t(
                  'Deletion of ' +
                    a.slice(0, -1) +
                    ` failed for: ${i} due to error: ${o}`,
                );
              },
            });
          },
          p = (e, t) => {
            let o = ' data-todo="none" ',
              l = '';
            ('copy' !== t && 'new' !== t) ||
              ((o = ' data-todo="create" new="true" '), (l = ' uncommitted ')),
              null == e && (e = { name: '', color: '', description: '' });
            const s = ` data-orig-val="${e.name}"`,
              r = ` data-orig-val="${e.color}"`,
              d = ` data-orig-val="${e.description}"`,
              c = $(
                `\n      <div class="label-entry ${l}" ${o}>        <div class="card">          <div class="card-body" id="label-grid">            <input name="name" type="text"             class="form-control label-fitting"             placeholder="Name" value="${e.name}" ${s}>            <input name="color" type="text"             class="form-control color-fitting color-box"             placeholder="Color" value="${e.color}" ${r}>            <div class="invalid-color-input hidden">              Invalid hex code.            </div>            <input name="description" type="text"             class="form-control description-fitting"             placeholder="Description" value="${e.description}"             ${d}>          </div>        </div>        <button type="button" class="btn btn-danger delete-button">          <i class="fas fa-trash-alt"></i>        </button>        <button type="button" class="btn btn-success hidden recover-button">          <i class="fas fa-history"></i>        </button>      <div>\n    `,
              );
            c.find('.color-box').css('background-color', '' + e.color),
              c.find(':input[data-orig-val]').keyup(function () {
                const e = $(this).closest('.label-entry');
                n(e)
                  ? (e.attr('data-todo', 'none'), e.removeClass('uncommitted'))
                  : ('true' === e.attr('new')
                      ? e.attr('data-todo', 'create')
                      : e.attr('data-todo', 'update'),
                    e.addClass('uncommitted')),
                  a();
              }),
              c.find('input[name="name"]').keyup(function () {
                const e = $(this).closest('.label-entry'),
                  t = $(this).val(),
                  n = $(this).attr('data-orig-val');
                i.has(t) && t !== n
                  ? (e.addClass('duplicate-entry'),
                    $(this).addClass('red-alert-background'),
                    alert('This label name has already been taken!'))
                  : (e.removeClass('duplicate-entry'),
                    $(this).removeClass('red-alert-background')),
                  a();
              }),
              c.children('.delete-button').click(function () {
                'true' === $(this).parent().attr('new')
                  ? $(this).parent().remove()
                  : ($(this).siblings('.card').addClass('deleted-card'),
                    $(this).siblings('.recover-button').removeAttr('disabled'),
                    $(this).addClass('hidden'),
                    $(this).parent().attr('data-todo', 'delete')),
                  $(this).siblings('.recover-button').removeClass('hidden'),
                  a();
              }),
              c.children('.recover-button').click(function () {
                $(this).siblings('.card').removeClass('deleted-card'),
                  $(this).siblings('.delete-button').removeClass('hidden'),
                  $(this).addClass('hidden');
                const e = $(this).closest('.label-entry');
                n(e)
                  ? e.attr('data-todo', 'none')
                  : e.attr('data-todo', 'update'),
                  a();
              }),
              c
                .find('.color-box')
                .ColorPicker({
                  color: e.color,
                  onSubmit: (e, t, o, l) => {
                    $(l).val('#' + t.toUpperCase()),
                      $(l).ColorPickerHide(),
                      $(l).css('background-color', '#' + t),
                      $(l).siblings('.invalid-color-input').addClass('hidden');
                    const s = $(l).closest('.label-entry');
                    n(s)
                      ? (s.attr('data-todo', 'none'),
                        s.removeClass('uncommitted'))
                      : ('true' === s.attr('new')
                          ? s.attr('data-todo', 'create')
                          : s.attr('data-todo', 'update'),
                        s.addClass('uncommitted')),
                      a();
                  },
                  onBeforeShow: function () {
                    $(this).ColorPickerSetColor(this.value.replace('#', ''));
                  },
                })
                .bind('keyup', function () {
                  const e = '#' + this.value.replace(/#|\s/g, '');
                  $(this).ColorPickerSetColor(e.replace('#', '')),
                    $(this).css('background-color', e),
                    '#' === e
                      ? $(this).css('background-color', '#FFFFFF')
                      : /^#([0-9A-F]{3}){1,2}$/i.test(e) &&
                        $(this)
                          .siblings('.invalid-color-input')
                          .addClass('hidden');
                })
                .blur(function () {
                  let e = '#' + this.value.replace(/#|\s/g, '');
                  '' === this.value
                    ? ($(this).val(this.value),
                      $(this)
                        .siblings('.invalid-color-input')
                        .addClass('hidden'))
                    : /^#([0-9A-F]{3}){1,2}$/i.test(e)
                    ? (4 === e.length &&
                        (e = e.replace(/(\w)(\w)(\w)/, '$1$1$2$2$3$3')),
                      $(this).val(e.toUpperCase()),
                      $(this)
                        .siblings('.invalid-color-input')
                        .addClass('hidden'))
                    : ($(this).val(e),
                      $(this)
                        .siblings('.invalid-color-input')
                        .removeClass('hidden'));
                }),
              $('#form-labels').prepend(c);
          };
        $('#add-new-label-entry').click(() => {
          p(null, 'new');
        });
        const v = (e, t) => {
          null == e &&
            (e = {
              title: '',
              state: 'open',
              description: '',
              due_on: '',
              number: null,
            }),
            'copy' === t && (e.number = null);
          let o = ' data-todo="none"',
            l = '';
          ('copy' !== t && 'new' !== t) ||
            ((o = ' data-todo="create" new="true" '), (l = ' uncommitted '));
          const s = ` data-orig-val="${e.title}"`,
            i = ` data-orig-val="${e.state}"`,
            d = ` data-orig-val="${e.description}"`,
            [c, u] = ((e) => {
              if (null === e || '' === e) return ['', ''];
              {
                const t = new Date(e),
                  n = {
                    year: t.getFullYear(),
                    month: t.getMonth() + 1,
                    dayOfMonth: t.getDate(),
                    hour: t.getHours(),
                    minute: t.getMinutes(),
                    second: t.getSeconds(),
                  };
                return (
                  Object.keys(n).forEach((e) => {
                    n[e] = n[e] < 10 ? '0' + n[e] : '' + n[e];
                  }),
                  [
                    `${n.year}-${n.month}-${n.dayOfMonth}`,
                    `${n.hour}:${n.minute}:${n.second}`,
                  ]
                );
              }
            })(e.due_on),
            b = ` data-orig-val="${c}"`,
            m = ` data-orig-time="${u}"`,
            p = e.number,
            v = $(
              `\n      <div class="milestone-entry ${l}" ${o}         data-number="${p}" data-state="${e.state}"         data-due-on="${e.due_on}">        <div class="card">          <div class="card-body">            <div class="flexbox-container">              <input name="title" type="text"               class="form-control title-fitting" placeholder="Title"               value="${e.title}" ${s}>              <input name="description" type="text"                 class="form-control description-fitting"                 placeholder="Description" value="${e.description}"                 ${d}>              <label>Due Date:                 <input name="due-date" type="date"                 class="form-control due-date-fitting pl-1"                 value="${c}" ${b} ${m}>              </label>              <label>Status:                 <select name="state" class="form-control state-fitting pl-2"                   ${i}>                  <option value="open">                    open                  </option>                  <option value="closed">                    closed                  </option>                </select>              </label>            </div>          </div>        </div>        <button type="button" class="btn btn-danger delete-button">          <i class="fas fa-trash-alt"></i>        </button>        <button type="button" class="btn btn-success hidden recover-button">          <i class="fas fa-history"></i>        </button>      </div>\n      `,
            );
          v
            .find('.state-fitting')
            .children()
            .each(function () {
              e.state === $(this).attr('value') && $(this).attr('selected', !0);
            }),
            v.find(':input[data-orig-val]').keyup(function () {
              const e = $(this).closest('.milestone-entry');
              n(e)
                ? (e.attr('data-todo', 'none'), e.removeClass('uncommitted'))
                : ('true' === e.attr('new')
                    ? e.attr('data-todo', 'create')
                    : e.attr('data-todo', 'update'),
                  e.addClass('uncommitted')),
                a();
            }),
            v
              .find('label')
              .children()
              .change(function () {
                const e = $(this).closest('.milestone-entry');
                n(e)
                  ? (e.attr('data-todo', 'none'), e.removeClass('uncommitted'))
                  : ('true' === e.attr('new')
                      ? e.attr('data-todo', 'create')
                      : e.attr('data-todo', 'update'),
                    e.addClass('uncommitted')),
                  a();
              }),
            v.find('input[name="title"]').keyup(function () {
              const e = $(this).closest('.milestone-entry'),
                t = $(this).val(),
                n = $(this).attr('data-orig-val');
              r.has(t) && t !== n
                ? (e.addClass('duplicate-entry'),
                  $(this).addClass('red-alert-background'),
                  alert('This milestone title has already been taken!'))
                : (e.removeClass('duplicate-entry'),
                  $(this).removeClass('red-alert-background')),
                a();
            }),
            v.children('.delete-button').click(function () {
              'true' === $(this).parent().attr('new')
                ? $(this).parent().remove()
                : ($(this).siblings('.card').addClass('deleted-card'),
                  $(this).siblings('.recover-button').removeAttr('disabled'),
                  $(this).addClass('hidden'),
                  $(this).parent().attr('data-todo', 'delete')),
                $(this).siblings('.recover-button').removeClass('hidden'),
                a();
            }),
            v.children('.recover-button').click(function () {
              $(this).siblings('.card').removeClass('deleted-card'),
                $(this).siblings('.delete-button').removeClass('hidden'),
                $(this).addClass('hidden');
              const e = $(this).closest('.milestone-entry');
              n(e)
                ? e.attr('data-todo', 'none')
                : e.attr('data-todo', 'update'),
                a();
            }),
            $('#form-milestones').prepend(v);
        };
        $('#add-new-milestone-entry').click(() => {
          v(null, 'new');
        });
        const g = (e) => {
            $('#form-' + e).text(''),
              $('#commit-to-target-repo').text('Commit changes'),
              $('#commit-to-target-repo').attr('disabled', !0),
              $('#commit-to-target-repo').removeClass('btn-success'),
              $('#commit-to-target-repo').addClass('btn-outline-success');
          },
          h = (t) => {
            const n = e();
            n.targetOwner && n.targetRepo
              ? ('labels' === t && g('labels'),
                'milestones' === t && g('milestones'),
                d(n.targetOwner, n.targetRepo, t, 'list'),
                $(`#${t}-tab`).tab('show'))
              : alert('Please enter the repo owner and the repo.');
          };
        $('#list-all-labels').click(() => {
          h('labels');
        }),
          $('#list-all-milestones').click(() => {
            h('milestones');
          }),
          $('#revert-labels-to-original').click(() => {
            g('labels');
            const t = e();
            d(t.targetOwner, t.targetRepo, 'labels', 'list');
          }),
          $('#revert-milestones-to-original').click(() => {
            g('milestones');
            const t = e();
            d(t.targetOwner, t.targetRepo, 'milestones', 'list');
          });
        const f = (e) => {
          $(e)
            .children()
            .each(function () {
              'true' === $(this).attr('new')
                ? $(this).remove()
                : ($(this).children('.card').addClass('deleted-card'),
                  $(this).children('.recover-button').removeAttr('disabled'),
                  $(this).children('.delete-button').addClass('hidden'),
                  $(this).children('.recover-button').removeClass('hidden'),
                  $(this).attr('data-todo', 'delete'));
            }),
            a();
        };
        $('#delete-all-labels').click(() => {
          f('#form-labels');
        }),
          $('#delete-all-milestones').click(() => {
            f('#form-milestones');
          });
        const y = (t) => {
          const n = e();
          n.copyFromOwner && n.copyFromRepo
            ? (d(n.copyFromOwner, n.copyFromRepo, t, 'copy'),
              $(`#${t}-tab`).tab('show'))
            : alert(
                'Please enter the repo owner and the repo you want to copy from.',
              ),
            a();
        };
        $('#copy-labels-from').click(() => {
          y('labels');
        }),
          $('#copy-milestones-from').click(() => {
            y('milestones');
          });
        const x = (e, t) => {
            const n = (e) => {
              const t = e.val(),
                n = e.attr('data-orig-time');
              if (!t) return null;
              const a = {};
              ([a.year, a.month, a.dayOfMonth] = t.split('-').map((e) => +e)),
                ([a.hour, a.minute, a.second] = n ? n.split(':') : [0, 0, 0]);
              return new Date(
                a.year,
                a.month - 1,
                a.dayOfMonth,
                a.hour,
                a.minute,
                a.second,
              )
                .toISOString()
                .replace('.000Z', 'Z');
            };
            return 'labels' === t
              ? {
                  name: e.find('[name="name"]').val(),
                  color: e.find('[name="color"]').val().slice(1),
                  description: e.find('[name="description"]').val(),
                  originalName: e.find('[name="name"]').attr('data-orig-val'),
                }
              : 'milestones' === t
              ? 'null' !== e.attr('data-number')
                ? {
                    title: e.find('[name="title"]').val(),
                    state: e.find('[name="state"]').val(),
                    description: e.find('[name="description"]').val(),
                    due_on: n(e.find('[name="due-date"]')),
                    number: +e.attr('data-number'),
                  }
                : '' !== e.find('[name="due-date"]').val()
                ? {
                    title: e.find('[name="title"]').val(),
                    state: e.find('[name="state"]').val(),
                    description: e.find('[name="description"]').val(),
                    due_on: n(e.find('[name="due-date"]')),
                  }
                : {
                    title: e.find('[name="title"]').val(),
                    state: e.find('[name="state"]').val(),
                    description: e.find('[name="description"]').val(),
                  }
              : void console.log('Bug in function serializeEntries!');
          },
          C = () => {
            $('#loadingModal').modal({ keyboard: !1, backdrop: 'static' }),
              (l = !0),
              $('.label-entry[data-todo="delete"]').each(function () {
                const e = x($(this), 'labels');
                m(e, 'labels');
              }),
              $('.milestone-entry[data-todo="delete"]').each(function () {
                const e = x($(this), 'milestones');
                m(e, 'milestones');
              }),
              $('.label-entry[data-todo="update"]').each(function () {
                const e = x($(this), 'labels');
                b(e, 'labels');
              }),
              $('.milestone-entry[data-todo="update"]').each(function () {
                const e = x($(this), 'milestones');
                b(e, 'milestones');
              }),
              $('.label-entry[data-todo="create"]').each(function () {
                const e = x($(this), 'labels');
                u(e, 'labels');
              }),
              $('.milestone-entry[data-todo="create"]').each(function () {
                const e = x($(this), 'milestones');
                u(e, 'milestones');
              });
          };
        $('#commit-to-target-repo').click(() => {
          const t = e();
          t.personalAccessToken
            ? C()
            : alert(
                `You need to enter your personal access token for repo           ${t.targetRepo} in order to commit changes.`,
              );
        }),
          $('#loadingModal').on('hidden.bs.modal', () => {
            (l = !1),
              $('#loadingModal .modal-body').text(''),
              $('#loadingModal .modal-body').append('<p>Commiting...'),
              $('#loadingModal .modal-footer').remove(),
              g('labels'),
              g('milestones');
            const t = e();
            d(t.targetOwner, t.targetRepo, 'labels', 'list'),
              d(t.targetOwner, t.targetRepo, 'milestones', 'list');
          });
      });
    (document.getElementById('navbar-anchor').innerHTML += a()),
      (document.getElementById(
        'content-anchor',
      ).innerHTML += `\n    <div id="content" class="container">\n      <div class="row">\n        <div class="col-12 col-lg-4">\n          ${o()}\n          ${l()}\n        </div>\n        <div class="col-12 col-lg-8">\n          ${s()}\n        </div>\n      </div>\n    </div>\x3c!-- /container --\x3e\n  `),
      (document.getElementById('loading-modal-anchor').innerHTML += i()),
      r();
  },
]);
