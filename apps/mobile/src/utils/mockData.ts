import {
  RawQuestion,
  LeaderboardEntry,
  LevelNode,
  Discipline,
} from '@edudeca/types';

export const QUESTION_BANK: RawQuestion[] = [
  { tag: 'PHYSICS', color: 'teal', q: 'What is the SI unit of force?', o: ['Newton', 'Joule', 'Watt', 'Pascal'], c: 0 },
  { tag: 'PHYSICS', color: 'teal', q: "Which is closest to light's speed in vacuum?", o: ['3×10⁸ m/s', '3×10⁵ m/s', '3×10³ m/s', '3×10¹⁰ m/s'], c: 0 },
  { tag: 'PHYSICS', color: 'teal', q: "Newton's third law describes:", o: ['Action–reaction pairs', 'Inertia only', 'Gravity only', 'Friction only'], c: 0 },
  { tag: 'PHYSICS', color: 'teal', q: 'The SI unit of electric current is:', o: ['Ampere', 'Volt', 'Ohm', 'Watt'], c: 0 },
  { tag: 'CHEMISTRY', color: 'amber', q: 'Atomic number represents the number of:', o: ['Protons', 'Neutrons', 'Total mass', 'Electrons in an ion'], c: 0 },
  { tag: 'CHEMISTRY', color: 'amber', q: 'The pH of pure water at 25°C is:', o: ['7', '0', '14', '1'], c: 0 },
  { tag: 'CHEMISTRY', color: 'amber', q: "Earth's atmosphere is mostly made of:", o: ['Nitrogen', 'Oxygen', 'Carbon dioxide', 'Argon'], c: 0 },
  { tag: 'CHEMISTRY', color: 'amber', q: 'The chemical symbol for Gold is:', o: ['Au', 'Ag', 'Gd', 'Go'], c: 0 },
  { tag: 'MATHS', color: 'teal', q: 'What is sin(90°)?', o: ['1', '0', '-1', '0.5'], c: 0 },
  { tag: 'MATHS', color: 'teal', q: 'Derivative of x² with respect to x is:', o: ['2x', 'x²', '2', 'x'], c: 0 },
  { tag: 'MATHS', color: 'teal', q: 'Sum of interior angles in a triangle:', o: ['180°', '90°', '360°', '270°'], c: 0 },
  { tag: 'APPLIED MATH', color: 'purple', q: 'Value of π rounded to 2 decimals:', o: ['3.14', '3.41', '2.14', '3.12'], c: 0 },
  { tag: 'VERBAL', color: 'teal', q: 'Synonym of "Abundant":', o: ['Plentiful', 'Scarce', 'Rare', 'Empty'], c: 0 },
  { tag: 'VERBAL', color: 'teal', q: 'Antonym of "Benevolent":', o: ['Malevolent', 'Kind', 'Generous', 'Charitable'], c: 0 },
  { tag: 'VERBAL', color: 'teal', q: 'Doctor : Hospital :: Teacher : ?', o: ['School', 'Hospital', 'Pen', 'Bus'], c: 0 },
  { tag: 'QUANTITATIVE', color: 'teal', q: 'A train covers 60 km in 1.5 hrs. Its speed?', o: ['40 km/h', '60 km/h', '90 km/h', '30 km/h'], c: 0 },
  { tag: 'QUANTITATIVE', color: 'teal', q: '15% of 200 is:', o: ['30', '15', '20', '45'], c: 0 },
  { tag: 'QUANTITATIVE', color: 'teal', q: 'Next number: 2, 4, 8, 16, ?', o: ['32', '24', '20', '18'], c: 0 },
  { tag: 'ANALYTICAL', color: 'purple', q: 'All Bloops are Razzies. All Razzies are Lazzies. All Bloops are:', o: ['Lazzies', 'Razzies only', 'Neither', 'Cannot be determined'], c: 0 },
  { tag: 'ANALYTICAL', color: 'purple', q: 'Pattern: Circle, Square, Circle, Square, ?', o: ['Circle', 'Triangle', 'Square', 'Pentagon'], c: 0 },
  { tag: 'GK', color: 'gold', q: 'Who is known as the Father of the Indian Constitution?', o: ['Dr. B.R. Ambedkar', 'Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel'], c: 0 },
  { tag: 'GK', color: 'gold', q: 'The longest river in India is:', o: ['Ganga', 'Yamuna', 'Godavari', 'Brahmaputra'], c: 0 },
  { tag: 'GK', color: 'gold', q: 'The Sun rises in the:', o: ['East', 'West', 'North', 'South'], c: 0 },
  { tag: 'FINLIT', color: 'pink', q: '"SIP" in investing stands for:', o: ['Systematic Investment Plan', 'Simple Interest Plan', 'Stock Investment Program', 'Secure Income Plan'], c: 0 },
  { tag: 'FINLIT', color: 'pink', q: '"Compound interest" means:', o: ['Interest on interest', 'Interest only on principal', 'A type of loan', 'A tax'], c: 0 },
  { tag: 'ENTREPRENEURSHIP', color: 'gold', q: 'A "startup pitch" is primarily used to:', o: ['Persuade investors', 'File taxes', 'Hire employees', 'Register a trademark'], c: 0 },
  { tag: 'ENTREPRENEURSHIP', color: 'gold', q: '"MVP" in startups stands for:', o: ['Minimum Viable Product', 'Most Valuable Player', 'Maximum Value Proposition', 'Market Validation Process'], c: 0 },
  { tag: 'BIOLOGY', color: 'teal', q: 'The powerhouse of the cell is the:', o: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi body'], c: 0 },
  { tag: 'BIOLOGY', color: 'teal', q: 'DNA stands for:', o: ['Deoxyribonucleic acid', 'Dioxyribose nucleic acid', 'Deoxyribose nuclear acid', 'Dinucleic ribo acid'], c: 0 },
  { tag: 'BIOTECHNOLOGY', color: 'purple', q: 'PCR is commonly used to:', o: ['Amplify DNA', 'Sequence proteins', 'Measure pH', 'Culture bacteria only'], c: 0 },
];

export const TEN_DISCIPLINE_TAGS = [
  'PHYSICS',
  'CHEMISTRY',
  'MATHS',
  'APPLIED MATH',
  'VERBAL',
  'QUANTITATIVE',
  'ANALYTICAL',
  'GK',
  'FINLIT',
  'ENTREPRENEURSHIP',
] as const;

export const DEFAULT_DISCIPLINES: Discipline[] = [
  { id: 'phy', name: 'Physics', tag: 'PHY', color: 'teal', isLocked: true },
  { id: 'chem', name: 'Chemistry', tag: 'CHEM', color: 'amber', isLocked: true },
  { id: 'verb', name: 'Verbal', tag: 'VERB', color: 'teal', isLocked: true },
  { id: 'quant', name: 'Quant', tag: 'QUANT', color: 'teal', isLocked: true },
  { id: 'analyt', name: 'Analytical', tag: 'ANLYT', color: 'purple', isLocked: true },
  { id: 'gk', name: 'GK', tag: 'GK', color: 'gold', isLocked: true },
  { id: 'fin', name: 'FinLit', tag: 'FIN', color: 'pink', isLocked: true },
  { id: 'ent', name: 'Entrep', tag: 'ENT', color: 'gold', isLocked: true },
  { id: 'math', name: 'Mathematics', tag: 'MATH', color: 'teal', track: 'A' },
  { id: 'appliedmath', name: 'Applied Math', tag: 'AMATH', color: 'teal', track: 'A' },
  { id: 'bio', name: 'Biology', tag: 'BIO', color: 'teal', track: 'B' },
  { id: 'biotech', name: 'Biotech', tag: 'BTC', color: 'purple', track: 'B' },
];

export const INDIA_LOCATIONS: Record<string, string[]> = {
  // 28 States
  'Andhra Pradesh': [
    'Ananthapuramu', 'Anakapalli', 'Annamayya', 'Bapatla', 'Chittoor',
    'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur',
    'Kakinada', 'Krishna', 'Kurnool', 'Nandyal', 'NTR (Vijayawada)',
    'Palnadu', 'Parvathipuram Manyam', 'Prakasam (Ongole)', 'Srikakulam',
    'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Tirupati', 'Visakhapatnam',
    'Vizianagaram', 'West Godavari', 'YSR Kadapa'
  ],
  'Arunachal Pradesh': [
    'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang',
    'Itanagar Capital Complex', 'Kamle', 'Kra Daadi', 'Kurung Kumey',
    'Leparada', 'Lohit', 'Longding', 'Lower Dibang Valley', 'Lower Siang',
    'Lower Subansiri', 'Namsai', 'Pakke Kessang', 'Papum Pare', 'Shi Yomi',
    'Siang', 'Tawang', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'
  ],
  'Assam': [
    'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar (Silchar)',
    'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh',
    'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat',
    'Kamrup Metropolitan (Guwahati)', 'Kamrup Rural', 'Karbi Anglong', 'Karimganj',
    'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari',
    'Sivasagar', 'Sonitpur (Tezpur)', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'
  ],
  'Bihar': [
    'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur',
    'Bhojpur (Arrah)', 'Buxar', 'Darbhanga', 'East Champaran (Motihari)',
    'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur (Bhabua)', 'Katihar',
    'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger',
    'Muzaffarpur', 'Nalanda (Bihar Sharif)', 'Nawada', 'Patna', 'Purnia',
    'Rohtas (Sasaram)', 'Saharsa', 'Samastipur', 'Saran (Chhapra)', 'Sheikhpura',
    'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali (Hajipur)', 'West Champaran (Bettiah)'
  ],
  'Chhattisgarh': [
    'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar (Jagdalpur)', 'Bemetara',
    'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg (Bhilai)',
    'Gariaband', 'Gaurela-Pendra-Marwahi', 'Janjgir-Champa', 'Jashpur',
    'Kabirdham (Kawardha)', 'Kanker', 'Khairagarh-Chhuikhadan-Gandai', 'Kondagaon',
    'Korba', 'Korea', 'Mahasamund', 'Manendragarh-Chirmiri-Bharatpur', 'Mohla-Manpur-Ambagarh Chowki',
    'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sarangarh-Bilaigarh',
    'Sakti', 'Sukma', 'Surajpur', 'Surguja (Ambikapur)'
  ],
  'Goa': [
    'North Goa (Panaji, Mapusa, Bicholim)', 'South Goa (Margao, Vasco da Gama, Ponda)'
  ],
  'Gujarat': [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha (Palanpur)',
    'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang',
    'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh',
    'Kheda (Nadiad)', 'Kutch (Bhuj)', 'Mahisagar', 'Mehsana', 'Morbi',
    'Narmada (Rajpipla)', 'Navsari', 'Panchmahal (Godhra)', 'Patan', 'Porbandar',
    'Rajkot', 'Sabarkantha (Himmatnagar)', 'Surat', 'Surendranagar', 'Tapi (Vyara)',
    'Vadodara', 'Valsad (Vapi)'
  ],
  'Haryana': [
    'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad',
    'Gurugram', 'Hisar', 'Jhajjar (Bahadurgarh)', 'Jind', 'Kaithal',
    'Karnal', 'Kurukshetra (Thanesar)', 'Mahendragarh (Narnaul)', 'Nuh',
    'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa',
    'Sonipat', 'Yamunanagar'
  ],
  'Himachal Pradesh': [
    'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra (Dharamshala)', 'Kinnaur',
    'Kullu (Manali)', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur (Nahan)',
    'Solan (Baddi)', 'Una'
  ],
  'Jharkhand': [
    'Bokaro (Steel City)', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka',
    'East Singhbhum (Jamshedpur)', 'Garhwa', 'Giridih', 'Godda', 'Gumla',
    'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga',
    'Pakur', 'Palamu (Medininagar)', 'Ramgarh', 'Ranchi', 'Sahibganj',
    'Saraikela-Kharsawan', 'Simdega', 'West Singhbhum (Chaibasa)'
  ],
  'Karnataka': [
    'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
    'Bidar', 'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
    'Dakshina Kannada (Mangaluru)', 'Davanagere', 'Dharwad (Hubballi)', 'Gadag',
    'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu (Madikeri)', 'Kolar', 'Koppal',
    'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru',
    'Udupi', 'Uttara Kannada (Karwar)', 'Vijayanagara (Hosapete)', 'Vijayapura', 'Yadgir'
  ],
  'Kerala': [
    'Alappuzha', 'Ernakulam (Kochi)', 'Idukki', 'Kannur', 'Kasaragod',
    'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
    'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
  ],
  'Madhya Pradesh': [
    'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat',
    'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur',
    'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar (Pithampur)', 'Dindori',
    'Guna', 'Gwalior', 'Harda', 'Hoshangabad (Narmadapuram)', 'Indore',
    'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Mandla',
    'Mandsaur', 'Morena', 'Narsinghpur', 'Neemuch', 'Niwari', 'Panna',
    'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore',
    'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi',
    'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'
  ],
  'Maharashtra': [
    'Ahmednagar', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar (Aurangabad)',
    'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli',
    'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur',
    'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar',
    'Nashik', 'Navi Mumbai', 'Dharashiv (Osmanabad)', 'Palghar (Vasai-Virar)',
    'Parbhani', 'Pune (Pimpri-Chinchwad)', 'Raigad (Panvel)', 'Ratnagiri',
    'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane (Kalyan-Dombivli)',
    'Wardha', 'Washim', 'Yavatmal'
  ],
  'Manipur': [
    'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West',
    'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl',
    'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'
  ],
  'Meghalaya': [
    'East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills (Shillong)',
    'Eastern West Khasi Hills', 'North Garo Hills', 'Ri Bhoi (Nongpoh)',
    'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills',
    'West Garo Hills (Tura)', 'West Jaintia Hills (Jowai)', 'West Khasi Hills'
  ],
  'Mizoram': [
    'Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai',
    'Lunglei', 'Mamit', 'Saiha', 'Saitual', 'Serchhip'
  ],
  'Nagaland': [
    'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung',
    'Mon', 'Niuland', 'Noklak', 'Peren', 'Phek', 'Shamator', 'Tseminyu',
    'Tuensang', 'Wokha', 'Zunheboto'
  ],
  'Odisha': [
    'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh',
    'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam (Berhampur)',
    'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal',
    'Kendrapara', 'Kendujhar (Keonjhar)', 'Khordha (Bhubaneswar)', 'Koraput (Jeypore)',
    'Malkangiri', 'Mayurbhanj (Baripada)', 'Nabarangpur', 'Nayagarh', 'Nuapada',
    'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur (Sonepur)', 'Sundargarh (Rourkela)'
  ],
  'Punjab': [
    'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
    'Fazilka (Abohar)', 'Ferozepur', 'Gurdaspur (Batala)', 'Hoshiarpur',
    'Jalandhar', 'Kapurthala (Phagwara)', 'Ludhiana (Khanna)', 'Malerkotla',
    'Mansa', 'Moga', 'Mohali (SAS Nagar)', 'Muktsar', 'Pathankot',
    'Patiala', 'Rupnagar', 'Sangrur', 'Shahid Bhagat Singh Nagar (Nawanshahr)', 'Tarn Taran'
  ],
  'Rajasthan': [
    'Ajmer (Kishangarh)', 'Alwar', 'Anupgarh', 'Balotra', 'Banswara',
    'Baran', 'Barmer', 'Beawar', 'Bharatpur', 'Bhilwara', 'Bikaner',
    'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Deeg', 'Dholpur',
    'Didwana-Kuchaman', 'Dudu', 'Dungarpur', 'Ganganagar', 'Gangapur City',
    'Hanumangarh', 'Jaipur Central', 'Jaipur Rural', 'Jaisalmer', 'Jalore',
    'Jhalawar', 'Jhunjhunu', 'Jodhpur City', 'Jodhpur Rural', 'Karauli',
    'Kekri', 'Khairthal-Tijara', 'Kota', 'Kotputli-Behror', 'Nagaur',
    'Neem Ka Thana', 'Pali', 'Phalodi', 'Pratapgarh', 'Rajsamand',
    'Salumbar', 'Sanchore', 'Sawai Madhopur', 'Shahpura', 'Sikar',
    'Sirohi', 'Tonk', 'Udaipur'
  ],
  'Sikkim': [
    'Gangtok', 'Gyalshing (Geyzing)', 'Mangan', 'Namchi', 'Pakyong', 'Soreng'
  ],
  'Tamil Nadu': [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
    'Kanyakumari (Nagercoil)', 'Karur', 'Krishnagiri (Hosur)', 'Madurai',
    'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris (Ooty)',
    'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem',
    'Sivaganga (Karaikkudi)', 'Tenkasi', 'Thanjavur (Kumbakonam)', 'Theni',
    'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur (Ambur, Vaniyambadi)',
    'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
    'Viluppuram', 'Virudhunagar (Sivakasi, Rajapalayam)'
  ],
  'Telangana': [
    'Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda (Warangal)', 'Hyderabad',
    'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal',
    'Kamareddy', 'Karimnagar', 'Khammam', 'Kumuram Bheem Asifabad',
    'Mahabubabad', 'Mahbubnagar', 'Mancherial', 'Medak', 'Medchal-Malkajgiri',
    'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal',
    'Nizamabad', 'Peddapalli (Ramagundam)', 'Rajanna Sircilla', 'Ranga Reddy',
    'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy',
    'Warangal Rural', 'Yadadri Bhuvanagiri'
  ],
  'Tripura': [
    'Dhalai (Ambassa)', 'Gomati (Udaipur)', 'Khowai', 'North Tripura (Dharmanagar)',
    'Sepahijala (Bishalgarh)', 'South Tripura (Belonia)', 'Unakoti (Kailashahar)', 'West Tripura (Agartala)'
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya',
    'Ayodhya (Faizabad)', 'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia',
    'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi',
    'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria',
    'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar (Noida, Greater Noida)',
    'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur',
    'Hardoi', 'Hathras', 'Jalaun (Orai)', 'Jaunpur', 'Jhansi', 'Kannauj',
    'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kheri (Lakhimpur)',
    'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri',
    'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar',
    'Pilibhit', 'Pratapgarh', 'Prayagraj (Allahabad)', 'Raebareli', 'Rampur',
    'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli',
    'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur',
    'Unnao', 'Varanasi'
  ],
  'Uttarakhand': [
    'Almora', 'Bageshwar', 'Chamoli (Gopeshwar)', 'Champawat', 'Dehradun (Rishikesh, Mussoorie)',
    'Haridwar (Roorkee)', 'Nainital (Haldwani)', 'Pauri Garhwal (Kotdwar)',
    'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar (Rudrapur, Kashipur)', 'Uttarkashi'
  ],
  'West Bengal': [
    'Alipurduar', 'Bankura', 'Birbhum (Suri, Bolpur)', 'Cooch Behar',
    'Dakshin Dinajpur (Balurghat)', 'Darjeeling (Siliguri)', 'Hooghly (Chinsurah, Chandannagar)',
    'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata',
    'Malda (English Bazar)', 'Murshidabad (Baharampur)', 'Nadia (Krishnanagar, Kalyani)',
    'North 24 Parganas (Barasat, Bidhannagar)', 'Paschim Bardhaman (Asansol, Durgapur)',
    'Paschim Medinipur (Midnapore, Kharagpur)', 'Purba Bardhaman', 'Purba Medinipur (Tamluk, Haldia)',
    'Purulia', 'South 24 Parganas (Alipore)', 'Uttar Dinajpur (Raiganj)'
  ],

  // 8 Union Territories
  'Andaman and Nicobar Islands': [
    'Nicobar', 'North and Middle Andaman', 'South Andaman (Port Blair)'
  ],
  'Chandigarh': [
    'Chandigarh'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Dadra and Nagar Haveli (Silvassa)', 'Daman', 'Diu'
  ],
  'Delhi (NCT)': [
    'Central Delhi', 'East Delhi', 'New Delhi (Connaught Place)', 'North Delhi',
    'North East Delhi', 'North West Delhi (Rohini)', 'Shahdara', 'South Delhi',
    'South East Delhi', 'South West Delhi (Dwarka)', 'West Delhi'
  ],
  'Jammu and Kashmir': [
    'Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal',
    'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch',
    'Pulwama', 'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian',
    'Srinagar', 'Udhampur'
  ],
  'Ladakh': [
    'Kargil', 'Leh'
  ],
  'Lakshadweep': [
    'Agatti', 'Amini', 'Andrott', 'Kavaratti', 'Minicoy'
  ],
  'Puducherry': [
    'Karaikal', 'Mahe', 'Puducherry', 'Yanam'
  ]
};

export const LEADERBOARD_DATA: Record<number, LeaderboardEntry[]> = {
  1: [
    { name: 'Ishita Rao', score: '10/10', time: '2:14', color: '#E85D8A' },
    { name: 'Rohan Verma', score: '10/10', time: '2:41', color: '#4FA3E8' },
    { name: 'Sneha Iyer', score: '9/10', time: '2:20', color: '#F0B429' },
  ],
  2: [
    { name: 'Aarav Shah', score: '10/10', time: '3:02', color: '#22D3A6' },
    { name: 'Diya Nair', score: '9/10', time: '2:58', color: '#7F77DD' },
    { name: 'Kabir Singh', score: '9/10', time: '3:10', color: '#EF9F27' },
  ],
  3: [
    { name: 'Meher Kapoor', score: '10/10', time: '3:20', color: '#E85D8A' },
    { name: 'Vivaan Joshi', score: '10/10', time: '3:35', color: '#4FA3E8' },
    { name: 'Ananya Pillai', score: '9/10', time: '3:12', color: '#F0B429' },
  ],
  4: [
    { name: 'Rohan Verma', score: '19/20', time: '8:45', color: '#4FA3E8' },
    { name: 'Ishita Rao', score: '18/20', time: '8:20', color: '#E85D8A' },
    { name: 'Aarav Shah', score: '18/20', time: '9:02', color: '#22D3A6' },
  ],
  5: [
    { name: 'Sneha Iyer', score: '19/20', time: '9:10', color: '#F0B429' },
    { name: 'Diya Nair', score: '18/20', time: '8:55', color: '#7F77DD' },
    { name: 'Kabir Singh', score: '17/20', time: '9:30', color: '#EF9F27' },
  ],
  6: [
    { name: 'Vivaan Joshi', score: '20/20', time: '9:48', color: '#4FA3E8' },
    { name: 'Meher Kapoor', score: '19/20', time: '9:20', color: '#E85D8A' },
    { name: 'Ananya Pillai', score: '18/20', time: '10:05', color: '#F0B429' },
  ],
  7: [
    { name: 'Ishita Rao', score: '29/30', time: '14:12', color: '#E85D8A' },
    { name: 'Rohan Verma', score: '28/30', time: '13:58', color: '#4FA3E8' },
    { name: 'Aarav Shah', score: '27/30', time: '14:40', color: '#22D3A6' },
  ],
  8: [
    { name: 'Diya Nair', score: '29/30', time: '14:30', color: '#7F77DD' },
    { name: 'Sneha Iyer', score: '28/30', time: '15:02', color: '#F0B429' },
    { name: 'Kabir Singh', score: '27/30', time: '14:55', color: '#EF9F27' },
  ],
  9: [
    { name: 'Vivaan Joshi', score: '30/30', time: '15:20', color: '#4FA3E8' },
    { name: 'Meher Kapoor', score: '29/30', time: '15:10', color: '#E85D8A' },
    { name: 'Ananya Pillai', score: '28/30', time: '15:45', color: '#F0B429' },
  ],
  10: [
    { name: 'Ishita Rao', score: '30/30', time: '16:02', color: '#E85D8A' },
    { name: 'Rohan Verma', score: '30/30', time: '16:18', color: '#4FA3E8' },
    { name: 'Vivaan Joshi', score: '29/30', time: '15:55', color: '#4FA3E8' },
  ],
};

export const LEVEL_PATH_DATA: LevelNode[] = [
  { n: 1, title: 'Level 1', sub: 'Start your first daily challenge', tier: 'free' },
  { n: 2, title: 'Level 2', sub: 'Building up — unlock after Level 1', tier: 'free' },
  { n: 3, title: 'Level 3', sub: 'Free zone complete — rank, streaks & leaderboard', tier: 'free' },
  { n: 4, title: 'Level 4', sub: 'Proctored round — identity verification required', tier: 'paid' },
  { n: 5, title: 'Level 5', sub: 'Proctored round — college-verified scores', tier: 'paid' },
  { n: 6, title: 'Level 6', sub: 'Proctored round — national shortlist gate', tier: 'paid' },
  { n: 7, title: 'Level 7', sub: 'Metro finals — physical test centers, Dec 2026', tier: 'finals' },
  { n: 8, title: 'Level 8', sub: 'Metro finals — sponsor-backed travel & lodging', tier: 'finals' },
  { n: 9, title: 'Level 9', sub: 'National semis — national visibility', tier: 'finals' },
  { n: 10, title: 'Level 10', sub: 'National Final — ₹10L winner · college prestige', tier: 'finals' },
];

export const TICKER_ITEMS = [
  'Aarav from Bengaluru just hit Level 7 in Physics 🔥',
  'Diya from Pune qualified for Metro Finals shortlist 🏆',
  'Rohan from Lucknow completed a 14-day streak ⚡',
  'Meher from Chennai jumped to Rank #312 nationally 📈',
];
