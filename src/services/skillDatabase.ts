export interface SkillCategory {
  category: string;
  skills: string[];
}

export const SKILL_SYNONYMS: Record<string, string> = {
  'py': 'Python',
  'python3': 'Python',
  'js': 'JavaScript',
  'ts': 'TypeScript',
  'reactjs': 'React',
  'react.js': 'React',
  'nodejs': 'Node.js',
  'node': 'Node.js',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'angularjs': 'Angular',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mongo': 'MongoDB',
  'powerbi': 'Power BI',
  'power bi': 'Power BI',
  'pbi': 'Power BI',
  'ms excel': 'Excel',
  'msexcel': 'Excel',
  'excel': 'Excel',
  'tableau': 'Tableau',
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'gcp': 'GCP',
  'google cloud': 'GCP',
  'k8s': 'Kubernetes',
  'docker': 'Docker',
  'ml': 'Machine Learning',
  'machine learning': 'Machine Learning',
  'dl': 'Deep Learning',
  'deep learning': 'Deep Learning',
  'nlp': 'NLP',
  'natural language processing': 'NLP',
  'cv': 'Computer Vision',
  'computer vision': 'Computer Vision',
  'sklearn': 'Scikit-learn',
  'scikit-learn': 'Scikit-learn',
  'scikit learn': 'Scikit-learn',
  'tf': 'TensorFlow',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
  'torch': 'PyTorch',
  'sql': 'SQL',
  'r': 'R',
  'git': 'Git',
  'github': 'Git',
  'gitlab': 'Git',
  'fastapi': 'FastAPI',
  'flask': 'Flask',
  'django': 'Django',
  'spring': 'Spring Boot',
  'springboot': 'Spring Boot',
  'statistics': 'Statistics',
  'stats': 'Statistics',
  'data analysis': 'Data Analysis',
  'data analytics': 'Data Analysis',
  'data science': 'Data Science',
  'bi': 'Business Intelligence',
  'etl': 'ETL',
  'spark': 'Apache Spark',
  'pyspark': 'Apache Spark',
  'apache spark': 'Apache Spark',
  'kafka': 'Kafka',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'html': 'HTML5',
  'html5': 'HTML5',
  'css': 'CSS3',
  'css3': 'CSS3',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
};

export const MASTER_SKILL_LIST: string[] = [
  // Programming Languages
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 'C#', 'SQL', 'R', 'Go',
  'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'Bash', 'Shell', 'MATLAB',

  // Data Science & Analytics
  'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'OpenCV',
  'NLP', 'NLTK', 'Spacy', 'HuggingFace', 'Transformers', 'LLMs', 'LangChain',
  'Data Analysis', 'Data Modeling', 'Data Visualization', 'Statistics', 'Mathematics',
  'Time Series', 'Predictive Modeling', 'A/B Testing', 'Feature Engineering',

  // BI & Reporting Tools
  'Power BI', 'Tableau', 'Excel', 'Advanced Excel', 'Looker', 'Qlik Sense', 'Google Data Studio',
  'Matplotlib', 'Seaborn', 'Plotly', 'D3.js', 'Business Intelligence',

  // Databases & Big Data
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra', 'SQLite', 'Oracle',
  'Snowflake', 'BigQuery', 'Apache Spark', 'Hadoop', 'Kafka', 'Hive', 'Airflow', 'ETL', 'Elasticsearch',

  // Web & Backend Frameworks
  'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask',
  'FastAPI', 'Spring Boot', 'ASP.NET', 'Ruby on Rails', 'GraphQL', 'REST APIs',
  'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Redux', 'WebSockets',

  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions',
  'Terraform', 'Ansible', 'Linux', 'Git', 'Nginx', 'Microservices', 'Serverless',

  // Mobile & Desktop
  'Android', 'iOS', 'React Native', 'Flutter', 'SwiftUI', 'Kotlin Multiplatform',

  // Software Engineering & Methodologies
  'Agile', 'Scrum', 'Jira', 'Unit Testing', 'TDD', 'System Design', 'OOP',
  'Data Structures', 'Algorithms', 'Clean Architecture', 'API Development',

  // Professional Soft Skills
  'Communication', 'Problem Solving', 'Leadership', 'Team Collaboration',
  'Critical Thinking', 'Project Management', 'Client Presentation'
];
