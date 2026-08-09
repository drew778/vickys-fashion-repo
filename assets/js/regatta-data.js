/* ============================================================
   VICKY'S FASHION — The Regatta Collection 44000
   A fabric line Vicky's Fashion carries (dobby cotton blend,
   codes 44xxx). Catalogue page-scans sourced from the supplier
   (D'finest Fabric). To self-host: set REG_BASE to
   "assets/img/regatta/" and drop the downloaded page files
   (Regatta_44000_p13.jpg …) into that folder.
   ============================================================ */
const REG_BASE = "https://www.xn--22c6cr7dc1l.com/sites/storage/files/users/1/c/b/7/1cb78c92-e1f5-46c4-8530-1ad4987cf033/";
const REGATTA = [13,14,15,19,20,21,22,23,24,25,26].map(n => ({ p:n, u: REG_BASE + n + ".jpg" }));
