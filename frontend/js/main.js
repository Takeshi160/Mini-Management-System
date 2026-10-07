//console.log("Mini Management System frontend loaded");

// Records page logic. Data is stored in localStorage so it persists between pages.
// To use a real backend, replace fetchRecords() and saveRecords() with fetch() calls.
 
const STORAGE_KEY = 'miniMS_records';
const PAGE_SIZE = 5;
 
let records = [];
let currentPage = 1;
let deleteId = null;
 
const $ = (id) => document.getElementById(id);
const editModal = new bootstrap.Modal($('editModal'));
const deleteModal = new bootstrap.Modal($('deleteModal'));

 
/* ---------- Helpers ---------- */
 
function escapeHtml(str) {
 const div = document.createElement('div');
 div.textContent = str;
 return div.innerHTML;
}
 
// [COMP-03] search + [COMP-06] filter
function getFiltered() {
 const q = $('searchInput').value.trim().toLowerCase();
 const status = $('filterStatus').value;
 return records.filter((r) =>
   (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)) &&
   (!status || r.status === status)
 );
}
 
function validate(form) {
 form.classList.add('was-validated');
 return form.checkValidity();
}

/* ---------- Rendering ---------- */
 
// [COMP-02] View Records table
function render() {
 const filtered = getFiltered();
 const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
 if (currentPage > totalPages) currentPage = totalPages;
 
 const start = (currentPage - 1) * PAGE_SIZE;
 const pageItems = filtered.slice(start, start + PAGE_SIZE);
 
 $('recordsBody').innerHTML = pageItems.map((r, i) => `
   <tr>
     <td>${start + i + 1}</td>
     <td>${escapeHtml(r.name)}</td>
     <td>${escapeHtml(r.email)}</td>
     <td><span class="badge r.status==='Active'?'bg-success':'bg-secondary'">{r.status}</span></td>
     <td class="text-end">
       <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${r.id}">Edit</button>
       <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${r.id}">Delete</button>
     </td>
   </tr>`).join('');
 
 $('emptyMsg').classList.toggle('d-none', filtered.length > 0);
 renderPagination(totalPages);
}

/* ---------- Events ---------- */ 
// [COMP-01] Add record
$('addForm').addEventListener('submit', (e) => {
 e.preventDefault();
 if (!validate(e.target)) return;
 const nextId = records.reduce((max, r) => Math.max(max, r.id), 0) + 1;
 records.push({
   id: nextId,
   name: $('addName').value.trim(),
   email: $('addEmail').value.trim(),
   status: $('addStatus').value
 });
 saveRecords();
 e.target.reset();
 e.target.classList.remove('was-validated');
 currentPage = Math.ceil(getFiltered().length / PAGE_SIZE) || 1; // jump to the new row
 render();
});

// Table button clicks: edit / delete
$('recordsBody').addEventListener('click', (e) => {
 const btn = e.target.closest('button[data-action]');
 if (!btn) return;
 const record = records.find((r) => r.id === Number(btn.dataset.id));
 if (!record) return;
 
 if (btn.dataset.action === 'edit') {
   // [COMP-04] open Edit modal
   $('editId').value = record.id;
   $('editName').value = record.name;
   $('editEmail').value = record.email;
   $('editStatus').value = record.status;
   $('editForm').classList.remove('was-validated');
   editModal.show();
} else {
   // [COMP-05] open Delete confirmation
   deleteId = record.id;
   $('deleteName').textContent = record.name;
   deleteModal.show();
 }
});

// [COMP-04] Save edit
$('editForm').addEventListener('submit', (e) => {
 e.preventDefault();
 if (!validate(e.target)) return;
 const record = records.find((r) => r.id === Number($('editId').value));
 record.name = $('editName').value.trim();
 record.email = $('editEmail').value.trim();
 record.status = $('editStatus').value;
 saveRecords();
 editModal.hide();
 render();
});
 
// [COMP-05] Confirm delete
$('confirmDelete').addEventListener('click', () => {
 records = records.filter((r) => r.id !== deleteId);
 saveRecords();
 deleteModal.hide();
 render();
});
 
// [COMP-03] Search and filter reset to page 1
['searchInput', 'filterStatus'].forEach((id) =>
 $(id).addEventListener('input', () => { currentPage = 1; render(); })
);

