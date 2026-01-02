const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/users.json');

// Ensure data file exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '{}', 'utf8'); // Using object for O(1) lookup by ID
}

class UserLocal {
    constructor(data) {
        this._id = data._id;
        this.habit = data.habit || null;
        this.logs = data.logs || [];
    }

    static async findById(id) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        if (data[id]) {
            return new UserLocal(data[id]);
        }
        return null;
    }

    async save() {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        data[this._id] = {
            _id: this._id,
            habit: this.habit,
            logs: this.logs
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        return this;
    }
}

module.exports = UserLocal;
