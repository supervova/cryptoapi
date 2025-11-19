# Модальное окно Bootpop

Использует разметку модалки Bootstrap'а, чтобы выводить системные сообщения. Заменить на old skull «тост».

```html
<div class="modal-backdrop fade in"></div>
<div class="modal fade in" tabindex="-1" role="dialog" aria-labelledby="bootpopup-title" style="display: block; padding-right: 15px">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="bootpopup-button close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
        <h4 class="modal-title" id="bootpopup-title">Error</h4>
      </div>
      <div class="modal-body">
        <form id="bootpopup-form4427133345789651" class="form-horizontal" onsubmit="return false;"><p>lorem ipsum</p></form>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal" data-callback="close" data-form="bootpopup-form4427133345789651">Close.</button></div>
    </div>
  </div>
</div>

```
