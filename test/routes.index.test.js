process.env.NODE_ENV = 'test'

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp)

const server = require('../index')

describe('routes : index', function ()  {
    this.timeout(0);

    describe('GET /', () => {
        it('should return json', (done) => {
            chai.request(server)
                .get('/')
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.status.should.equal('success');
                    done();
                })
        });

        it('filter by teacher id', (done) => {
            chai.request(server)
                .get('/?teacherIds=1')
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.status.should.equal('success');
                    res.body.data
                        .map(lesson => lesson.teachers)
                        .every(teachers => teachers.should.include(1));
                    done();
                })
        });

        it('filter by date', (done) => {
            chai.request(server)
                .get('/?date=2019-09-01')
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.status.should.equal('success');
                    res.body.data
                        .every(lesson => lesson.date.should.equal('2019-09-01'));
                    done();
                })
        });

        it('filter by status', function (done) {
            chai.request(server)
                .get('/?status=1')
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.status.should.equal('success');
                    res.body.data
                        .every(lesson => lesson.status.should.eql(1));
                    done();
                })
        });

        it('filter by students count', function (done) {
            chai.request(server)
                .get('/?studentsCount=1')
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.status.should.equal('success');
                    res.body.data
                        .every(lesson => lesson.students.length.should.eql(1));
                    done();
                })
        });
    })

    describe('POST /lessons ', () => {
        it('should return array of created lessons id', (done) => {
            chai.request(server)
                .post('/lessons')
                .send({
                    teacherIds: [1,2],
                    title: "Blue Ocean",
                    days: [0,1],
                    firstDate: "2019-09-10",
                    lessonsCount: 2
                })
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.status.should.equal('success');
                    res.body.data.should.be.an('array');
                    res.body.data
                        .every(id => id.should.be.an('number'));
                    console.log(res.body.data);
                    done();
                })
        });
    })
})