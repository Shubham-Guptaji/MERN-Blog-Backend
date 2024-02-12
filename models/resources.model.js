import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    resource : {
        resource_id: {
            string: true,
            required: true
        },
        resource_url: {
            string: true,
            required: true
        }
    }
}, {timestamps: true});

const Resourcefile = mongoose.model('Resource', resourceSchema);

export default Resourcefile;