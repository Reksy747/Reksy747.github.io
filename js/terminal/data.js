// Short summary for the terminal only. The full record lives in cv.html and portfolio.html;
// tests/data-sync.test.mjs fails if a role or repo here stops matching those pages.

const profile = {
    name: 'Petrus Chanel Reksy Arfila',
    title: 'DevOps Engineer',
    employer: 'MEMBER.ID',
    location: 'South Jakarta · Hybrid',
    stack: 'GCP · Alibaba Cloud · AWS · Kubernetes',
    summary: [
        'I run cloud infrastructure on Google Cloud and Alibaba Cloud, on-premises Linux servers, and the CI/CD pipelines that deploy to them.',
        'Nearly five years designing, automating and maintaining infrastructure across cloud and on-premises environments: first as a Site Reliability Engineer at Pegipegi, now as a DevOps Engineer at MEMBER.ID.'
    ],
    resumeUrl: 'https://drive.google.com/file/d/1SHfUOhkKift7SdeT7EdSMaQGtsuMURkG/view?usp=sharing',
    cvUrl: 'cv.html',
    portfolioUrl: 'portfolio.html'
};

const roles = [
    { title: 'DevOps Engineer', company: 'MEMBER.ID', years: '2023–present' },
    { title: 'Site Reliability Engineer', company: 'Pegipegi', years: '2021–2023' },
    { title: 'Assistant Lecturer, Administration Systems', company: 'Duta Wacana Christian University', years: '2021' },
    { title: 'Backend Developer', company: 'Dutatani.id, Duta Wacana Christian University', years: '2020–2021' },
    { title: 'Computer Technician', company: 'Freelance', years: '2017–2021' },
    { title: 'IT Support Technician', company: 'SMK Petrus Kanisius Klaten', years: '2016–2017' },
    { title: 'IT Support Technician', company: 'Gadjah Mada University (UGM)', years: '2016' }
];

const repos = [
    { name: 'Golang-On-Cluster-GKE', url: 'https://github.com/Reksy747/Golang-On-Cluster-GKE', visibility: 'Public', line: 'A Go web service (gorilla/mux) with tests for every route, shipped by a GitHub Actions pipeline: build, test, package with Docker, push to Docker Hub, and deploy to a Google Kubernetes Engine cluster behind a load balancer.' },
    { name: 'CICD-Deploy-Java-Spring', url: null, visibility: 'Private', line: 'A Spring Boot web app (Thymeleaf) serving my online portfolio, with MockMvc tests on its routes, shipped by a GitHub Actions pipeline: Gradle build and test, Docker image pushed to Docker Hub, and deployment to Google Kubernetes Engine.' },
    { name: 'testgan2', url: null, visibility: 'Private', line: 'A Jenkins pipeline for a Java service: checkout, Gradle build on a GCP build agent, then a Docker image tagged by build time and pushed to Amazon ECR, with a Kubernetes service manifest and New Relic agent configuration alongside.' },
    { name: 'testgan', url: 'https://github.com/Reksy747/testgan', visibility: 'Public', line: 'A containerised Java service built with Gradle.' },
    { name: 'reksytestrail', url: null, visibility: 'Private', line: 'A full-stack Nuxt application with its own server API and data models, GitHub Actions workflows, and enforced commit conventions with Husky and commitlint.' },
    { name: 'dutani', url: 'https://github.com/Reksy747/dutani', visibility: 'Public', line: 'E-learning Dutatani: an application where farmers share agricultural knowledge.' },
    { name: 'Adblock-list', url: 'https://github.com/Reksy747/Adblock-list', visibility: 'Public', line: 'A domain blocklist for Pi-hole and ad blockers.' }
];

const education = [
    { school: 'Duta Wacana Christian University', course: 'Bachelor of Science in Computer Science', years: '2017–2021' },
    { school: 'Petrus Kanisius Vocational High School', course: 'Computer and Networking', years: '2014–2017' }
];

const socials = [
    { label: 'GitHub', href: 'https://github.com/Reksy747' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/reksy/' },
    { label: 'Email', href: 'mailto:reksy737@gmail.com' }
];

export default { profile, roles, repos, education, socials };
