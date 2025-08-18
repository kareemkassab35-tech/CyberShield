
const siteRef = db.collection('site').doc('main');
const toolsRef = db.collection('content').doc('main').collection('tools');
const articlesRef = db.collection('content').doc('main').collection('articles');
const videosRef = db.collection('content').doc('main').collection('videos');

auth.onAuthStateChanged(user=>{
  if(user){ document.getElementById('authBox').style.display='none'; document.getElementById('adminPanel').style.display='block'; loadSiteSettings(); }
  else { document.getElementById('authBox').style.display='block'; document.getElementById('adminPanel').style.display='none'; }
});

async function login(){
  try{
    await auth.signInWithEmailAndPassword(
      document.getElementById('email').value,
      document.getElementById('password').value
    );
    document.getElementById('authMsg').textContent='تم تسجيل الدخول.';
  }catch(e){ document.getElementById('authMsg').textContent='فشل الدخول: '+e.message; }
}

async function loadSiteSettings(){
  const s=await siteRef.get(); const d=s.exists?s.data():{};
  document.getElementById('siteNameInput').value = d.name || 'CyberShield';
  document.getElementById('heroTitleInput').value = d.heroTitle || 'تعلم الأمن السيبراني والبرمجة بسهولة';
  document.getElementById('heroDescInput').value = d.heroDesc || 'دروس وأدوات عملية ومحتوى محدث.';
}

async function uploadImg(inputId, field){
  const file = document.getElementById(inputId).files[0];
  if(!file) return alert('اختر ملفاً أولاً');
  try{
    const up = await uploadToCloudinary(file);
    await siteRef.set({ [field]: up.secure_url }, { merge:true });
    document.getElementById('siteMsg').textContent='تم الرفع والحفظ: '+field;
  }catch(e){ document.getElementById('siteMsg').textContent='فشل الرفع: '+e.message; }
}

async function saveSite(){
  await siteRef.set({
    name: document.getElementById('siteNameInput').value,
    heroTitle: document.getElementById('heroTitleInput').value,
    heroDesc: document.getElementById('heroDescInput').value
  }, { merge:true });
  document.getElementById('siteMsg').textContent='تم حفظ الإعدادات.';
}

// Tools (metadata only)
async function addTool(){
  const key = document.getElementById('toolKey').value.trim();
  const name = document.getElementById('toolName').value.trim();
  const desc = document.getElementById('toolDesc').value.trim();
  if(!key) return document.getElementById('toolsMsg').textContent='أدخل مفتاح الأداة';
  await toolsRef.doc(key).set({name, desc, updatedAt: new Date()});
  document.getElementById('toolsMsg').textContent='تم حفظ الأداة.';
}

// Articles
async function publishArticle(){
  const title = document.getElementById('articleTitle').value;
  const body = document.getElementById('articleBody').value;
  const coverFile = document.getElementById('articleCover').files[0];
  let coverUrl='';
  if(coverFile){ const up=await uploadToCloudinary(coverFile); coverUrl=up.secure_url; }
  await articlesRef.add({ title, body, coverUrl, createdAt: new Date() });
  document.getElementById('articlesMsg').textContent='تم نشر المقال.';
}

// Videos
async function publishVideo(){
  const title=document.getElementById('videoTitle').value;
  const url=document.getElementById('videoUrl').value;
  const thumbFile=document.getElementById('videoThumb').files[0];
  let thumbUrl='';
  if(thumbFile){ const up=await uploadToCloudinary(thumbFile); thumbUrl=up.secure_url; }
  await videosRef.add({ title, url, thumbUrl, createdAt: new Date() });
  document.getElementById('videosMsg').textContent='تم نشر الفيديو.';
}
