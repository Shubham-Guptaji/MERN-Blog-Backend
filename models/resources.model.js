import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "User Id is required."],
    },
    resource : {
        resource_id: {
            type: String,
            required: [true, "Resource id is required"]
        },
        resource_url: {
            type: String,
            required: [true, "Resource url is required"]
        }
    },
    blog : {
        type: mongoose.Schema.Types.ObjectId,
        // required: [true, "Blog Id is required."],
    }
}, {timestamps: true});

const Resourcefile = mongoose.model('Resource', resourceSchema);

export default Resourcefile;