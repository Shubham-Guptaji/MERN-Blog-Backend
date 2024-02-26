import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    resource : {
        resource_id: {
            type: String,
            required: true
        },
        resource_url: {
            type: String,
            required: true
        }
    }
}, {timestamps: true});

const Resourcefile = mongoose.model('Resource', resourceSchema);

export default Resourcefile;